"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ChevronRight,
  HeartPulse,
  Volume1,
  Volume2,
  Waves,
} from "lucide-react";

type BreathingPhase = "Inhale..." | "Hold" | "Exhale..." | "Hold";

const phases: BreathingPhase[] = ["Inhale...", "Hold", "Exhale...", "Hold"];
const breathingSteps = [
  { id: "in", stepNumber: 1, label: "In" },
  { id: "hold-a", stepNumber: 2, label: "Hold" },
  { id: "out", stepNumber: 3, label: "Out" },
  { id: "hold-b", stepNumber: 4, label: "Hold" },
] as const;
const soundscapes = [
  { key: "rain", label: "RAIN" },
  { key: "lofi", label: "LO-FI" },
  { key: "ocean", label: "OCEAN" },
] as const;

const SOUND_MAP = {
  rain: "/sounds/rain.mp3",
  lofi: "/sounds/lofi.mp3",
  ocean: "/sounds/ocean.mp3",
} as const;

type SoundKey = keyof typeof SOUND_MAP;
const INITIAL_VOLUME = 0.5;

export default function BoxBreathingSessionPage() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedSound, setSelectedSound] = useState<SoundKey>("rain");
  const [volume, setVolume] = useState(INITIAL_VOLUME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(240);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isSessionActive) return;

    const phaseTimer = window.setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 4000);

    return () => window.clearInterval(phaseTimer);
  }, [isSessionActive]);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = INITIAL_VOLUME;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  const handleSoundSelect = async (sound: SoundKey) => {
    setSelectedSound(sound);

    if (!audioRef.current) return;

    const audio = audioRef.current;
    const nextSource = SOUND_MAP[sound];

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = nextSource;
      audio.load();
      audio.loop = true;
      audio.volume = volume;
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!isSessionActive) return;

    const countdownTimer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [isSessionActive]);

  const timeRemaining = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [remainingSeconds]);

  const isInhale = phases[phaseIndex] === "Inhale...";
  const phaseLabel = isSessionActive ? phases[phaseIndex] : "Session Ended";

  return (
    <div className="flex min-h-full w-full flex-col bg-[#f2f7f6]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600">
                Protocol: Box Breathing
              </p>
              <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                Live Session
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Active Neural Regulation
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Time Remaining
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">
                {timeRemaining}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSessionActive(false)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-800"
            >
              End Session
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-[#f4fbfa] to-[#eef6f5] p-6 shadow-sm sm:p-8">
          <div className="flex h-full min-h-[520px] flex-col items-center justify-center">
            <div className="relative grid h-72 w-72 place-items-center rounded-full sm:h-80 sm:w-80">
              <div className="absolute h-[115%] w-[115%] rounded-full border border-teal-200/70" />
              <div className="absolute h-[92%] w-[92%] rounded-full border border-teal-100/80" />
              <div
                className={`absolute h-56 w-56 rounded-full bg-teal-300/20 blur-2xl transition-all duration-700 ${
                  isInhale ? "scale-110" : "scale-95"
                }`}
              />
              <div
                className={`relative grid h-52 w-52 place-items-center rounded-full bg-radial-[at_40%_35%] from-white via-teal-50 to-teal-100/80 ring-1 ring-teal-200/70 transition-all duration-700 sm:h-60 sm:w-60 ${
                  isInhale ? "scale-105" : "scale-95"
                }`}
              >
                <div className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-slate-900">
                    {phaseLabel}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-teal-700">
                    Nose Entry
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 w-full max-w-lg">
              <div className="grid grid-cols-4 gap-2">
                {breathingSteps.map((step, index) => (
                  <div key={step.id} className="text-center">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isSessionActive && index === phaseIndex
                          ? "text-teal-700"
                          : "text-slate-400"
                      }`}
                    >
                      Step {step.stepNumber}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold uppercase tracking-wider ${
                        isSessionActive && index === phaseIndex
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSessionActive && index === phaseIndex
                            ? "w-full bg-teal-500"
                            : "w-0"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Physiological Sync
              </p>
              <Waves size={15} className="text-teal-600" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Calm Index
              </p>
              <p className="mt-2 text-3xl font-black text-teal-600">88%</p>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                <svg viewBox="0 0 220 70" className="h-14 w-full" aria-hidden="true">
                  <line
                    x1="0"
                    y1="42"
                    x2="220"
                    y2="42"
                    stroke="#cbd5e1"
                    strokeDasharray="4 6"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M0 48 C22 44, 36 33, 58 35 C76 36, 90 44, 114 40 C136 36, 145 26, 166 29 C182 31, 198 36, 220 22"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Heart Rate (BPM)
                </p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-2xl font-black text-slate-900">64</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    -4%
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  HRV Stability
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-bold text-teal-700">Optimal</p>
                  <HeartPulse size={16} className="text-teal-600" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Session Note
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Alpha wave activity is increasing. Maintain consistent intervals
              for maximum neuro-regulation.
            </p>
          </section>
        </aside>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Background Soundscape
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {soundscapes.map((soundscape) => (
                <button
                  key={soundscape.key}
                  type="button"
                  onClick={() => {
                    void handleSoundSelect(soundscape.key);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    selectedSound === soundscape.key
                      ? "border-teal-200 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {soundscape.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Volume
            </p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
              <Volume1 size={16} className="text-slate-500" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-600"
              />
              <Volume2 size={16} className="text-slate-500" />
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isPlaying ? "Audio Active" : "Tap a soundscape to start"}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition-colors hover:bg-slate-50 xl:self-auto"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 text-white">
              <Activity size={18} />
            </span>
            <span className="text-left">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Next Phase
              </span>
              <span className="block text-sm font-bold text-slate-900">
                Post-Session Journal
              </span>
            </span>
            <ChevronRight size={17} className="text-slate-400" />
          </button>
        </div>
      </footer>
    </div>
  );
}
