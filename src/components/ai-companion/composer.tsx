import { ArrowUp, Bot, Loader2, Mic, Square } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type RecordingPhase = "idle" | "recording" | "finalizing";

const WAVEFORM_BAR_COUNT = 120;
const EMPTY_WAVEFORM_BARS = createEmptyWaveform(WAVEFORM_BAR_COUNT);

export default function Composer({
  input,
  onInputChange,
  onSend,
  isTyping,
  isDisabled = false,
  placeholder = "Type a message or use / command...",
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (text: string) => void;
  isTyping: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const baseInputRef = useRef("");

  const waveformFrameRef = useRef<number | null>(null);
  const waveformTimerRef = useRef<number | null>(null);
  const waveformShiftRef = useRef<number | null>(null);
  const waveformContextRef = useRef<AudioContext | null>(null);
  const waveformSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const waveformAnalyserRef = useRef<AnalyserNode | null>(null);

  const [recordingPhase, setRecordingPhase] = useState<RecordingPhase>("idle");
  const [micError, setMicError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>(
    EMPTY_WAVEFORM_BARS,
  );
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const isClientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isMediaRecorderSupported =
    isClientReady &&
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(window.MediaRecorder) &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const isRecording = recordingPhase === "recording";
  const isBusy = recordingPhase === "finalizing";
  const isVoiceRailVisible = isRecording || isBusy;
  const isComposerLocked = isDisabled || isTyping || isBusy;
  const canSend = input.trim().length > 0 && !isComposerLocked && !isRecording;
  const timerLabel =
    isRecording || isBusy ? formatDuration(recordingSeconds) : null;

  const statusLabel = micError
    ? micError
    : isBusy
      ? "Transcribing your voice note..."
      : isRecording
        ? "Recording voice note..."
        : statusMessage
          ? statusMessage
          : input.trim()
            ? "Press Enter to send. Use Shift + Enter for a new line."
            : "Tap the mic to record a voice note.";

  const statusTone = micError
    ? "text-rose-600"
    : isBusy
      ? "text-sky-600"
      : isRecording
        ? "text-slate-700"
        : statusMessage
          ? "text-teal-700"
          : "text-slate-400";

  const resetWaveform = useCallback(() => {
    if (waveformFrameRef.current !== null) {
      window.cancelAnimationFrame(waveformFrameRef.current);
      waveformFrameRef.current = null;
    }

    if (waveformTimerRef.current !== null) {
      window.clearInterval(waveformTimerRef.current);
      waveformTimerRef.current = null;
    }

    if (waveformShiftRef.current !== null) {
      window.clearInterval(waveformShiftRef.current);
      waveformShiftRef.current = null;
    }

    if (waveformSourceRef.current) {
      waveformSourceRef.current.disconnect();
      waveformSourceRef.current = null;
    }

    waveformAnalyserRef.current = null;

    if (waveformContextRef.current) {
      void waveformContextRef.current.close();
      waveformContextRef.current = null;
    }

    setWaveformBars(EMPTY_WAVEFORM_BARS);
    setRecordingSeconds(0);
  }, []);

  const releaseCaptureResources = useCallback(() => {
    if (mediaStreamRef.current) {
      cleanupMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    }

    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    resetWaveform();
  }, [resetWaveform]);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      releaseCaptureResources();
    };
  }, [releaseCaptureResources]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [input]);

  const handleInputUpdate = useCallback(
    (value: string) => {
      if (micError) {
        setMicError(null);
      }

      if (statusMessage) {
        setStatusMessage(null);
      }

      onInputChange(value);
    },
    [micError, onInputChange, statusMessage],
  );

  const startWaveform = useCallback(
    async (stream: MediaStream) => {
      if (typeof window === "undefined") {
        return;
      }

      const AudioContextCtor =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextCtor) {
        return;
      }

      resetWaveform();

      const audioContext = new AudioContextCtor();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);

      waveformContextRef.current = audioContext;
      waveformSourceRef.current = source;
      waveformAnalyserRef.current = analyser;

      const timeDomainData = new Uint8Array(analyser.fftSize);
      const startedAt = Date.now();

      waveformTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
      }, 250);

      const tick = () => {
        waveformAnalyserRef.current?.getByteTimeDomainData(timeDomainData);
        waveformFrameRef.current = window.requestAnimationFrame(tick);
      };

      waveformShiftRef.current = window.setInterval(() => {
        const nextBarHeight = sampleWaveformBar(timeDomainData);
        setWaveformBars((current) => [...current.slice(1), nextBarHeight]);
      }, 70);

      tick();
    },
    [resetWaveform],
  );

  const startRecording = useCallback(async () => {
    if (!isMediaRecorderSupported) {
      setMicError("Voice input is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];
      baseInputRef.current = input.trim() ? `${input.trim()} ` : "";

      const mimeType = getSupportedRecordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      setMicError(null);
      setStatusMessage(null);
      setRecordingSeconds(0);
      setWaveformBars(EMPTY_WAVEFORM_BARS);
      await startWaveform(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setMicError("Recording failed. Please try again.");
        setRecordingPhase("idle");
        releaseCaptureResources();
      };

      recorder.onstop = async () => {
        try {
          const recordedMimeType = recorder.mimeType || "audio/webm";
          const audioBlob = new Blob(recordedChunksRef.current, {
            type: recordedMimeType,
          });

          if (audioBlob.size === 0) {
            setMicError("We couldn't detect speech.");
            return;
          }

          const extension = recordedMimeType.includes("ogg") ? "ogg" : "webm";
          const formData = new FormData();
          formData.append("file", audioBlob, `voice-note.${extension}`);

          const response = await fetch("/api/transcribe/deepgram", {
            method: "POST",
            body: formData,
          });

          const payload = (await response.json()) as {
            transcript?: string;
            message?: string;
          };

          if (!response.ok) {
            throw new Error(payload.message || "Unable to transcribe audio.");
          }

          const transcript = String(payload.transcript ?? "").trim();

          if (!transcript) {
            setMicError("We couldn't detect speech.");
            return;
          }

          onInputChange(joinTranscriptParts(baseInputRef.current, transcript));
          setMicError(null);
          setStatusMessage("Voice note added to your draft.");
        } catch (error) {
          console.error("Voice transcription failed:", error);
          setMicError("Voice transcription failed. Please try again.");
        } finally {
          setRecordingPhase("idle");
          releaseCaptureResources();
        }
      };

      recorder.start(180);
      setRecordingPhase("recording");
    } catch (error) {
      console.error("Unable to start voice recording:", error);
      setMicError("Microphone permission was denied or unavailable.");
      setRecordingPhase("idle");
      releaseCaptureResources();
    }
  }, [
    input,
    isMediaRecorderSupported,
    onInputChange,
    releaseCaptureResources,
    startWaveform,
  ]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    setRecordingPhase("finalizing");
    mediaRecorderRef.current.stop();
  }, []);

  const handleMicToggle = useCallback(() => {
    if (isDisabled || isTyping) {
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    if (isBusy) {
      return;
    }

    void startRecording();
  }, [isBusy, isDisabled, isRecording, isTyping, startRecording, stopRecording]);

  return (
    <section className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
          <div
            className={`px-5 transition-[padding] duration-300 ease-out ${
              isVoiceRailVisible ? "pt-5" : "pt-3"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => handleInputUpdate(event.target.value)}
              disabled={isComposerLocked}
              rows={3}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !isComposerLocked &&
                  !isRecording
                ) {
                  event.preventDefault();
                  onSend(input);
                }
              }}
              placeholder={placeholder}
              className={`w-full resize-none bg-transparent text-[16px] leading-7 text-slate-700 outline-none transition-[min-height] duration-300 ease-out placeholder:text-slate-300 disabled:cursor-not-allowed disabled:text-slate-400 ${
                isVoiceRailVisible ? "min-h-[108px]" : "min-h-[64px]"
              }`}
            />
          </div>

          <div
            className={`flex items-center gap-4 border-t border-slate-100 px-5 transition-[padding] duration-300 ease-out ${
              isVoiceRailVisible ? "py-4" : "py-3"
            }`}
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
              <Bot className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div
                className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out ${
                  isVoiceRailVisible
                    ? "mb-2 max-h-16 opacity-100"
                    : "mb-0 max-h-0 opacity-0"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-11 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-50 px-3">
                    <div className="absolute inset-x-3 top-1/2 border-t border-dashed border-slate-300" />
                    <div
                      className="relative z-10 grid h-full items-center gap-x-px"
                      style={{
                        gridTemplateColumns: `repeat(${waveformBars.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {waveformBars.map((barHeight, index) => (
                        <span key={index} className="flex justify-center">
                          <span
                            className="w-[3px] rounded-full bg-slate-900 transition-[height,opacity] duration-100"
                            style={{
                              height: `${Math.max(3, barHeight)}px`,
                              opacity: barHeight > 0 ? 1 : 0,
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {timerLabel ? (
                    <span className="w-11 shrink-0 text-right text-[13px] font-medium text-slate-500">
                      {timerLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <p className={`text-[11px] font-medium ${statusTone}`}>
                {statusLabel}
              </p>
            </div>

            <button
              type="button"
              disabled={isDisabled || isTyping || !isMediaRecorderSupported || isBusy}
              onClick={handleMicToggle}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                isRecording
                  ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300`}
              aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
              title={isRecording ? "Stop voice recording" : "Start voice recording"}
            >
              {isBusy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isRecording ? (
                <Square size={16} />
              ) : (
                <Mic size={18} />
              )}
            </button>

            <button
              type="button"
              disabled={!canSend}
              onClick={() => onSend(input)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Send message"
              title="Send message"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>

        {!isMediaRecorderSupported ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-semibold text-amber-700">
            Voice input is not supported in this browser.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getSupportedRecordingMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function cleanupMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function joinTranscriptParts(base: string, next: string) {
  const left = base.trim();
  const right = next.trim();

  if (!left) return right;
  if (!right) return left;

  return `${left} ${right}`.trim();
}

function createEmptyWaveform(count: number) {
  return Array.from({ length: count }, () => 0);
}

function sampleWaveformBar(data: Uint8Array) {
  let sumSquares = 0;

  for (let index = 0; index < data.length; index += 1) {
    const normalizedSample = ((data[index] ?? 128) - 128) / 128;
    sumSquares += normalizedSample * normalizedSample;
  }

  const rms = Math.sqrt(sumSquares / Math.max(1, data.length));

  if (rms < 0.02) {
    return 0;
  }

  const scaled = (rms - 0.02) / 0.22;
  const normalized = Math.min(1, Math.max(0, scaled));

  return Math.round(4 + normalized * 30);
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
