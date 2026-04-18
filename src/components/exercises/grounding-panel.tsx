"use client";

import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Crosshair,
  Eye,
  Hand,
  Ear,
  Wind,
  Cookie,
  RotateCcw,
  Quote,
  Volume2,
  Play,
  Square,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGroundingSensoryAnchor, GroundingSensoryAnchorPayload } from "@/api/reframing";

type SenseStep = {
  id: string;
  sense: string;
  icon: LucideIcon;
  count: number;
  prompt: string;
  helper: string;
  placeholders: string[];
};

const STEPS: SenseStep[] = [
  {
    id: "see",
    sense: "See",
    icon: Eye,
    count: 5,
    prompt: "Name 5 things you can see right now.",
    helper:
      "Look around your immediate environment. Notice colors, shapes, textures, or movement.",
    placeholders: [
      "e.g. The blue sky outside the window",
      "e.g. My phone on the desk",
      "e.g. A plant in the corner",
      "e.g. Light reflecting off the wall",
      "e.g. The pattern on the carpet",
    ],
  },
  {
    id: "touch",
    sense: "Touch",
    icon: Hand,
    count: 4,
    prompt: "Name 4 things you can physically feel.",
    helper:
      "Focus on physical sensations. What surfaces are you touching? What textures do you notice?",
    placeholders: [
      "e.g. The fabric of my shirt on my skin",
      "e.g. The cool surface of the desk",
      "e.g. My feet pressing against the floor",
      "e.g. The warmth of the cup in my hands",
    ],
  },
  {
    id: "hear",
    sense: "Hear",
    icon: Ear,
    count: 3,
    prompt: "Name 3 things you can hear.",
    helper:
      "Pause and listen carefully. Include background sounds you normally filter out.",
    placeholders: [
      "e.g. The hum of the air conditioner",
      "e.g. Birds chirping outside",
      "e.g. Keys clicking on a keyboard",
    ],
  },
  {
    id: "smell",
    sense: "Smell",
    icon: Wind,
    count: 2,
    prompt: "Name 2 things you can smell.",
    helper:
      "Breathe in slowly. If you cannot detect anything, move closer to an object and try again.",
    placeholders: [
      "e.g. Fresh coffee from down the hall",
      "e.g. The faint scent of hand lotion",
    ],
  },
  {
    id: "taste",
    sense: "Taste",
    icon: Cookie,
    count: 1,
    prompt: "Name 1 thing you can taste.",
    helper:
      "Notice any lingering taste in your mouth. Take a sip of water or a small bite if nothing comes to mind.",
    placeholders: ["e.g. The cool mint from my toothpaste"],
  },
];

type StepAnswers = Record<string, string[]>;

function createEmptyAnswers(): StepAnswers {
  const answers: StepAnswers = {};
  for (const step of STEPS) {
    answers[step.id] = Array.from<string>({ length: step.count }).fill("");
  }
  return answers;
}

export default function GroundingPanel() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<StepAnswers>(createEmptyAnswers);
  const [isComplete, setIsComplete] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [sensoryNarrative, setSensoryNarrative] = useState<string>("");

  const currentStep = STEPS[currentStepIndex];
  const isFinalStep = currentStepIndex === STEPS.length - 1;

  const stepFilledCount = useCallback(
    (stepId: string) => {
      return (answers[stepId] ?? []).filter((a) => a.trim().length > 0).length;
    },
    [answers],
  );

  const canMoveNext = useMemo(() => {
    return stepFilledCount(currentStep.id) >= currentStep.count;
  }, [stepFilledCount, currentStep]);

  const progressPercent = useMemo(() => {
    let filled = 0;
    let total = 0;
    for (const step of STEPS) {
      total += step.count;
      filled += stepFilledCount(step.id);
    }
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }, [stepFilledCount]);

  const handleInputChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      const arr = [...(updated[currentStep.id] ?? [])];
      arr[index] = value;
      updated[currentStep.id] = arr;
      return updated;
    });
  };

  const handleNext = async () => {
    if (isFinalStep) {
      setIsSynthesizing(true);
      
      try {
        const payload: GroundingSensoryAnchorPayload = {
          see: answers["see"] || [],
          touch: answers["touch"] || [],
          hear: answers["hear"] || [],
          smell: answers["smell"] || [],
          taste: answers["taste"] || [],
        };

        const response = await getGroundingSensoryAnchor(payload);
        setSensoryNarrative(response.grounding_summarry);
        
        // Brief delay to ensure the animation feels natural
        setTimeout(() => {
          setIsSynthesizing(false);
          setIsComplete(true);
        }, 1500);
      } catch (error) {
        console.error("Failed to generate sensory anchor:", error);
        setIsSynthesizing(false);
        setIsComplete(true);
      }
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (isComplete) {
      setIsComplete(false);
    } else {
      setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setAnswers(createEmptyAnswers());
    setIsComplete(false);
  };

  if (isSynthesizing) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center rounded-b-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="h-24 w-24 rounded-full border-t-2 border-teal-500/30"
          />
          <Sparkles className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-teal-600" />
        </div>
        <h2 className="mt-8 text-xl font-bold text-slate-900">Synthesizing Your Sensory Narrative</h2>
        <p className="mt-2 text-sm text-slate-500">Weaving your 15 anchors into a clinical grounding map...</p>
        <div className="mt-6 flex gap-1">
           {[0, 1, 2].map((i) => (
             <motion.div
               key={i}
               animate={{ opacity: [0.3, 1, 0.3] }}
               transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
               className="h-1.5 w-1.5 rounded-full bg-teal-600"
             />
           ))}
        </div>
      </motion.div>
    );
  }

  if (isComplete) {
    return (
      <CompletionScreen
        answers={answers}
        onReset={handleReset}
        sensoryNarrative={sensoryNarrative}
      />
    );
  }

  const Icon = currentStep.icon;
  const currentAnswers = answers[currentStep.id] ?? [];

  return (
    <section className="rounded-b-3xl border border-slate-200 bg-white shadow-sm">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-8">
        {/* Top nav row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-700"
          >
            <ArrowLeft size={12} />
            Exercises
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Acute Relief
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              5 Min
            </span>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Step{" "}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {currentStepIndex + 1}
              </span>
              <span className="text-xs text-slate-400">
                /{STEPS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Main content row */}
        <div className="mt-6 flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <Crosshair size={22} className="text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                5-4-3-2-1 Sensory Grounding
              </h1>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                Redirect attention from anxious thoughts to the present moment by
                engaging each of your five senses, one step at a time.
              </p>
            </div>
          </div>

          {/* Expert Quote Card - Top Right */}
          <div className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-4 sm:max-w-[340px]">
            <div className="flex items-start gap-3">
              <Quote size={18} className="mt-0.5 shrink-0 text-slate-300" />
              <p className="text-[11px] font-medium leading-relaxed text-slate-600">
                "This exercise acts as an immediate distraction that diverts our
                attention away from anxious thoughts, by engaging our senses. It
                moves us from an overthinking mindset to a noticing one."
                <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  — Steph Strauss, Mindfulness Expert
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="px-5 py-5 sm:px-7">
        {/* Progress bar */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <span>Session Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Current sense</span>
            <span className="font-semibold text-slate-700">
              {currentStep.sense}
            </span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const filled = stepFilledCount(step.id);
            const done = filled >= step.count;

            return (
              <div
                key={step.id}
                className={`rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
                  index === currentStepIndex
                    ? "border-teal-200 bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                    : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <CircleDashed size={13} />
                  )}
                  <StepIcon size={13} />
                  <span>
                    {step.count} {step.sense}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active step content */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Current Step
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
                <Icon size={20} className="text-teal-600" />
                {currentStep.count} Things You {currentStep.sense}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {currentStep.prompt}
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                canMoveNext
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {canMoveNext ? "Ready" : "Input Required"}
            </span>
          </div>

          {/* Helper hint */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-600">
              {currentStep.helper}
            </p>
          </div>

          {/* Input fields */}
          <div className="mt-4 space-y-3">
            {currentAnswers.map((value, index) => (
              <div key={`${currentStep.id}-${index}`} className="relative">
                <span className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-teal-50 text-[10px] font-bold text-teal-600">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={value}
                  onChange={(event) =>
                    handleInputChange(index, event.target.value)
                  }
                  placeholder={currentStep.placeholders[index]}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {canMoveNext
              ? "All fields completed. Continue when ready."
              : `Fill in all ${currentStep.count} field${currentStep.count > 1 ? "s" : ""} to proceed.`}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canMoveNext}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isFinalStep ? "Complete" : "Next"}
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Completion Screen                                         */
/* ─────────────────────────────────────────────────────────── */

function CompletionScreen({
  answers,
  onReset,
  sensoryNarrative,
}: {
  answers: StepAnswers;
  onReset: () => void;
  sensoryNarrative: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use the live API narrative, falling back to a standard calm prompt if empty
  const narrativeText = sensoryNarrative || "As you return to the present... notice the world you've mapped. You are grounded, safe, and entirely here.";

  const handleTogglePlayback = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    try {
      setIsBuffering(true);
      const response = await fetch("/api/tts/cartesia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: narrativeText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Voice generation failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio Playback Error:", error);
      alert(error instanceof Error ? error.message : "Failed to play voice");
    } finally {
      setIsBuffering(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  return (
    <section className="rounded-b-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-8">
        <Link
          href="/exercises"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-700"
        >
          <ArrowLeft size={12} />
          Exercises
        </Link>
        <div className="mt-5 flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
            <CheckCircle2 size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Grounding Complete
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
              You have successfully anchored yourself in the present moment
              through all five senses.
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-5 sm:px-7">
        {/* Success banner */}
        <div className="rounded-xl border border-emerald-100 bg-teal-50/20 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <Volume2 size={24} />
             </div>
             <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                Your Sensory Anchor
             </h2>
             
             {/* Sensory Narrative Section */}
             <div className="relative mt-8 max-w-xl">
                <Quote size={40} className="absolute -left-6 -top-6 opacity-5 text-teal-900" />
                <p className="relative text-lg font-medium italic leading-relaxed text-slate-700">
                   "{narrativeText}"
                </p>
             </div>

             {/* Deepgram TTS Player */}
             <div className="mt-8 w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center gap-4">
                   <button 
                      onClick={handleTogglePlayback}
                      disabled={isBuffering}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                   >
                      {isBuffering ? (
                         <Loader2 size={24} className="animate-spin" />
                      ) : isPlaying ? (
                         <Square size={24} fill="white" />
                      ) : (
                         <Play size={24} fill="white" className="ml-1" />
                      )}
                   </button>
                   <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {isBuffering ? "Generating Voice..." : isPlaying ? "Speaking..." : "Cartesia Voice (Sophie)"}
                         </span>
                         <span className="text-[8px] font-bold text-teal-600">SONIC-3.0</span>
                      </div>
                      {/* Waveform */}
                      <div className="mt-3 flex items-end gap-[3px] h-8">
                         {[...Array(24)].map((_, i) => (
                           <motion.div 
                             key={i} 
                             animate={isPlaying ? { height: [`${Math.random() * 40 + 20}%`, `${Math.random() * 80 + 20}%`, `${Math.random() * 30 + 10}%`] } : { height: "20%" }}
                             transition={isPlaying ? { duration: 0.5, repeat: Infinity, delay: i * 0.05 } : {}}
                             className={`w-1 rounded-full transition-colors ${isPlaying ? "bg-teal-500" : "bg-slate-200"}`}
                           />
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-8 h-px bg-slate-100" />
        
        <div className="mt-8 text-center">
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Supporting Metadata</h3>
        </div>

        {/* Summary of all answers */}
        <div className="mt-5 space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const stepAnswers = (answers[step.id] ?? []).filter(
              (a) => a.trim().length > 0,
            );

            return (
              <div
                key={step.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {step.count} {step.sense}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {stepAnswers.map((answer, index) => (
                    <li
                      key={`${step.id}-summary-${index}`}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[9px] font-bold text-teal-600">
                        {index + 1}
                      </span>
                      {answer}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-teal-700"
          >
            <RotateCcw size={13} />
            Start Over
          </button>
          <Link
            href="/exercises"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Crosshair size={13} />
            Return to Exercises
          </Link>
        </div>
      </div>
    </section>
  );
}
