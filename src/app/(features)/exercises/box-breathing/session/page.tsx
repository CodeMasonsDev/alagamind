"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Volume1,
  Volume2,
  Wind,
  Timer,
  Repeat,
  Activity,
} from "lucide-react";
import { BoxBreathPayload } from "@/types/BoxBreathPayload";
import { createBoxBreath } from "@/api/exercise-protocols";
import { getMe, SessionUser } from "@/api/auth/auth";

/* ─────────────────────── constants ─────────────────────── */

type Phase = "Inhale" | "Hold" | "Exhale" | "Rest";

const PHASES: { id: string; label: Phase; cue: string }[] = [
  { id: "in", label: "Inhale", cue: "Breathe in slowly through your nose" },
  { id: "hold-a", label: "Hold", cue: "Hold gently — no tension" },
  { id: "out", label: "Exhale", cue: "Release slowly through your mouth" },
  { id: "hold-b", label: "Rest", cue: "Pause — stay relaxed" },
];

const PHASE_DURATION_MS = 4000;
const PHASE_DURATION_S = PHASE_DURATION_MS / 1000;
const SESSION_DURATION_S = 240; // 4 minutes
const PROGRESS_TICK_MS = 50;

const SOUND_MAP = {
  rain: "/sounds/rain.mp3",
  lofi: "/sounds/lofi.mp3",
  ocean: "/sounds/ocean.mp3",
} as const;

type SoundKey = keyof typeof SOUND_MAP;

const soundscapes: { key: SoundKey; label: string }[] = [
  { key: "rain", label: "Rain" },
  { key: "lofi", label: "Lo-Fi" },
  { key: "ocean", label: "Ocean" },
];

/* ─────────────────────── component ─────────────────────── */

export default function BoxBreathingSessionPage() {
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0-100
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_S);
  const [isActive, setIsActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [totalBreaths, setTotalBreaths] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState();
  // audio
  const [selectedSound, setSelectedSound] = useState<SoundKey>("rain");
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isRunning = isActive && !isPaused;

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const res = await getMe();
        setProfile(res);
      } catch (error) {
        if (isMounted) setProfile(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ── phase cycling ── */
  useEffect(() => {
    if (!isRunning) return;

    const phaseTimer = window.setInterval(() => {
      setPhaseIndex((prev) => {
        const next = (prev + 1) % PHASES.length;
        if (next === 0) setCycles((c) => c + 1);
        // count inhale & exhale as breaths
        if (
          PHASES[next].label === "Inhale" ||
          PHASES[next].label === "Exhale"
        ) {
          setTotalBreaths((b) => b + 1);
        }
        return next;
      });
      setPhaseProgress(0);
    }, PHASE_DURATION_MS);

    return () => window.clearInterval(phaseTimer);
  }, [isRunning]);

  /* ── phase progress animation ── */
  useEffect(() => {
    if (!isRunning) return;

    const tick = window.setInterval(() => {
      setPhaseProgress((prev) => {
        const next = prev + (PROGRESS_TICK_MS / PHASE_DURATION_MS) * 100;
        return Math.min(next, 100);
      });
    }, PROGRESS_TICK_MS);

    return () => window.clearInterval(tick);
  }, [isRunning]);

  /* ── session countdown ── */
  useEffect(() => {
    if (!isRunning) return;

    const countdown = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [isRunning]);

  /* ── audio setup ── */
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleSoundSelect = useCallback(
    async (sound: SoundKey) => {
      setSelectedSound(sound);
      if (!audioRef.current) return;

      const audio = audioRef.current;
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = SOUND_MAP[sound];
        audio.load();
        audio.loop = true;
        audio.volume = volume;
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    },
    [volume],
  );

  /* ── controls ── */
  const handlePauseResume = () => {
    if (!isActive) return;
    setIsPaused((prev) => {
      const willPause = !prev;
      // pause/resume audio
      if (audioRef.current && isPlaying) {
        if (willPause) audioRef.current.pause();
        else void audioRef.current.play();
      }
      return willPause;
    });
  };

  const handleRestart = () => {
    setPhaseIndex(0);
    setPhaseProgress(0);
    setRemainingSeconds(SESSION_DURATION_S);
    setIsActive(true);
    setIsPaused(false);
    setCycles(0);
    setTotalBreaths(0);
  };

  const handleEnd = (payload: BoxBreathPayload) => {
    setIsActive(false);
    setIsPaused(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    console.log(payload);

    handleSaveBoxBreathing(payload);
  };

  /* ── derived ── */
  const timeDisplay = useMemo(() => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [remainingSeconds]);

  const elapsed = SESSION_DURATION_S - remainingSeconds;
  const elapsedDisplay = useMemo(() => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [elapsed]);

  const currentPhase = PHASES[phaseIndex];
  const isInhale = currentPhase.label === "Inhale";
  const phaseSecondsLeft = Math.ceil(
    (PHASE_DURATION_S * (100 - phaseProgress)) / 100,
  );

  const statusLabel = !isActive
    ? "Session Complete"
    : isPaused
      ? "Paused"
      : currentPhase.label;

  async function handleSaveBoxBreathing(payload: BoxBreathPayload) {
    try {
      const res = await createBoxBreath(payload);
      console.log("Success,", res);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 dark:border-slate-800  dark:bg-slate-950/50 dark:backdrop-blur-md px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          {/* Top nav row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/exercises"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
            >
              <ArrowLeft size={12} />
              Exercises
            </Link>

            <div className="flex items-center gap-2">
              <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Regulation
              </span>
              <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                4 Min
              </span>
              {isActive && (
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                    isPaused
                      ? "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isPaused ? "Paused" : "Live"}
                </span>
              )}
            </div>
          </div>

          {/* Main content row */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-teal-600">
                <Wind size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Box Breathing
                </h1>
                <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  4-second inhale, hold, exhale, rest cycle for nervous system
                  regulation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isActive && (
                <button
                  type="button"
                  onClick={handlePauseResume}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {isPaused ? (
                    <>
                      <Play size={14} />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause size={14} />
                      Pause
                    </>
                  )}
                </button>
              )}
              {isActive ? (
                <button
                  type="button"
                  onClick={() =>
                    handleEnd({
                      userId: profile?.id as string,
                      cycles: cycles,
                      breaths: totalBreaths,
                      elapsed: elapsedDisplay,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-teal-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 dark:hover:bg-teal-500"
                >
                  End Session
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-teal-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 dark:hover:bg-teal-500"
                >
                  <RotateCcw size={14} />
                  Start Over
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
        {/* Breathing circle */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 shadow-sm sm:p-8">
          <div className="flex h-full min-h-[480px] flex-col items-center justify-center">
            {/* Circle */}
            <div className="relative grid h-72 w-72 place-items-center rounded-full sm:h-80 sm:w-80">
              <div className="absolute h-[115%] w-[115%] rounded-full border border-slate-200/70 dark:border-slate-800" />
              <div className="absolute h-[92%] w-[92%] rounded-full border border-slate-100 dark:border-slate-900" />
              <div
                className={`absolute h-56 w-56 rounded-full bg-teal-300/20 blur-2xl transition-all duration-700 ${
                  isRunning && isInhale ? "scale-110" : "scale-95"
                }`}
              />
              <div
                className={`relative grid h-52 w-52 place-items-center rounded-full bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-700 sm:h-60 sm:w-60 ${
                  isRunning && isInhale ? "scale-105" : "scale-95"
                }`}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                    {statusLabel}
                  </p>
                  {isRunning && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {currentPhase.cue}
                    </p>
                  )}
                  {isRunning && (
                    <p className="mt-3 text-2xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
                      {phaseSecondsLeft}s
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phase progress bars */}
            <div className="mt-10 w-full max-w-lg">
              <div className="grid grid-cols-4 gap-2">
                {PHASES.map((phase, index) => {
                  const isDone = isRunning && index < phaseIndex;
                  const isCurrent = isRunning && index === phaseIndex;
                  const wasDone = !isActive && true;

                  return (
                    <div key={phase.id} className="text-center">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest ${
                          isCurrent
                            ? "text-slate-900 dark:text-slate-100"
                            : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {phase.label}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all"
                          style={{
                            width: isCurrent
                              ? `${phaseProgress}%`
                              : isDone || wasDone
                                ? "100%"
                                : "0%",
                            transitionDuration: isCurrent ? "50ms" : "300ms",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar — session stats */}
        <aside className="space-y-4">
          {/* Timer */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Time Remaining
            </p>
            <p className="mt-2 text-4xl font-black tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
              {timeDisplay}
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{
                  width: `${((SESSION_DURATION_S - remainingSeconds) / SESSION_DURATION_S) * 100}%`,
                }}
              />
            </div>
          </section>

          {/* Stats */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Session Stats
            </p>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Repeat size={13} />
                  Cycles
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {cycles}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Wind size={13} />
                  Breaths
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {totalBreaths}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Timer size={13} />
                  Elapsed
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {elapsedDisplay}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Activity size={13} />
                  Phase Timer
                </div>
                <p className="text-lg font-bold tabular-nums text-teal-600 dark:text-teal-400">
                  {isRunning ? `${phaseSecondsLeft}s` : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Session note */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Guidance
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {!isActive
                ? "Great session. Consistent box breathing activates the parasympathetic nervous system, lowering cortisol and heart rate over time."
                : isPaused
                  ? "Take your time. Resume when you are ready to continue the breathing pattern."
                  : "Focus on keeping each phase equal in length. Let the timer guide you — no need to count on your own."}
            </p>
          </section>
        </aside>
      </main>

      {/* ── Footer — soundscape controls ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 dark:backdrop-blur-md px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Background Soundscape
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {soundscapes.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => void handleSoundSelect(s.key)}
                  className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    selectedSound === s.key
                      ? "border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xs">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Volume
            </p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 px-3 py-2">
              <Volume1
                size={16}
                className="shrink-0 text-slate-400 dark:text-slate-600"
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-800 accent-teal-600 dark:accent-teal-500"
              />
              <Volume2
                size={16}
                className="shrink-0 text-slate-400 dark:text-slate-600"
              />
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {isPlaying ? "Audio Active" : "Tap a soundscape to start"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
