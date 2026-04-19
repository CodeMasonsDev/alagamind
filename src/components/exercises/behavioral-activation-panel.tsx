"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Crosshair,
  Heart,
  RotateCcw,
  Sparkles,
  Star,
  Users,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────── types & constants ─────────────────────── */

type StepId = "mood" | "brainstorm" | "plan" | "commitment";

type Step = {
  id: StepId;
  title: string;
  prompt: string;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    id: "mood",
    title: "Mood Check-In",
    prompt: "Rate how you are feeling right now before we begin.",
    icon: Activity,
  },
  {
    id: "brainstorm",
    title: "Activity Brainstorm",
    prompt:
      "List activities that could improve your mood across three categories.",
    icon: Sparkles,
  },
  {
    id: "plan",
    title: "Action Plan",
    prompt: "Select up to 3 activities and schedule when you will do them.",
    icon: CalendarCheck,
  },
  {
    id: "commitment",
    title: "Commitment",
    prompt: "Review your plan, rate your confidence, and commit.",
    icon: Star,
  },
];

type ActivityCategory = "pleasure" | "mastery" | "social";

type ActivityEntry = {
  text: string;
  category: ActivityCategory;
};

type PlannedAction = {
  activity: string;
  when: string;
};

type Draft = {
  moodRating: number;
  moodNote: string;
  pleasureActivities: string[];
  masteryActivities: string[];
  socialActivities: string[];
  plannedActions: PlannedAction[];
  confidenceRating: number;
  encouragementNote: string;
};

const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; icon: LucideIcon; color: string; hint: string }
> = {
  pleasure: {
    label: "Pleasure",
    icon: Heart,
    color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50",
    hint: "Activities that bring joy, fun, or relaxation.",
  },
  mastery: {
    label: "Mastery",
    icon: Star,
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50",
    hint: "Activities that give a sense of accomplishment or skill-building.",
  },
  social: {
    label: "Social",
    icon: Users,
    color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-900/50",
    hint: "Activities that involve connecting with others.",
  },
};

function createEmptyDraft(): Draft {
  return {
    moodRating: 5,
    moodNote: "",
    pleasureActivities: ["", ""],
    masteryActivities: ["", ""],
    socialActivities: ["", ""],
    plannedActions: [
      { activity: "", when: "" },
      { activity: "", when: "" },
      { activity: "", when: "" },
    ],
    confidenceRating: 5,
    encouragementNote: "",
  };
}

/* ─────────────────────── main component ─────────────────────── */

export default function BehavioralActivationPanel() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>(createEmptyDraft);
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const isFinalStep = currentStepIndex === STEPS.length - 1;

  /* ── validation ── */
  const canMoveNext = useMemo(() => {
    switch (currentStep.id) {
      case "mood":
        return draft.moodNote.trim().length > 0;
      case "brainstorm":
        return (
          draft.pleasureActivities.some((a) => a.trim().length > 0) &&
          draft.masteryActivities.some((a) => a.trim().length > 0) &&
          draft.socialActivities.some((a) => a.trim().length > 0)
        );
      case "plan":
        return draft.plannedActions.some(
          (a) => a.activity.trim().length > 0 && a.when.trim().length > 0,
        );
      case "commitment":
        return true;
      default:
        return false;
    }
  }, [currentStep.id, draft]);

  const progressPercent = useMemo(() => {
    if (isComplete) return 100;
    let points = 0;
    const total = 4;

    if (draft.moodNote.trim().length > 0) points += 1;
    if (
      draft.pleasureActivities.some((a) => a.trim().length > 0) &&
      draft.masteryActivities.some((a) => a.trim().length > 0) &&
      draft.socialActivities.some((a) => a.trim().length > 0)
    )
      points += 1;
    if (
      draft.plannedActions.some(
        (a) => a.activity.trim().length > 0 && a.when.trim().length > 0,
      )
    )
      points += 1;
    if (draft.confidenceRating > 0) points += 1;

    return Math.round((points / total) * 100);
  }, [draft, isComplete]);

  /* ── all brainstormed activities (for Step 3 picker) ── */
  const allActivities = useMemo<ActivityEntry[]>(() => {
    const entries: ActivityEntry[] = [];
    const cats: [ActivityCategory, string[]][] = [
      ["pleasure", draft.pleasureActivities],
      ["mastery", draft.masteryActivities],
      ["social", draft.socialActivities],
    ];
    for (const [cat, list] of cats) {
      for (const text of list) {
        if (text.trim().length > 0) {
          entries.push({ text: text.trim(), category: cat });
        }
      }
    }
    return entries;
  }, [
    draft.pleasureActivities,
    draft.masteryActivities,
    draft.socialActivities,
  ]);

  /* ── handlers ── */
  const handleNext = () => {
    if (isFinalStep) {
      setIsComplete(true);
    } else {
      setCurrentStepIndex((p) => p + 1);
    }
  };

  const handleBack = () => {
    if (isComplete) {
      setIsComplete(false);
    } else {
      setCurrentStepIndex((p) => Math.max(0, p - 1));
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setDraft(createEmptyDraft());
    setIsComplete(false);
  };

  const updateCategoryActivities = useCallback(
    (category: ActivityCategory, index: number, value: string) => {
      setDraft((prev) => {
        const key = `${category}Activities` as keyof Draft;
        const arr = [...(prev[key] as string[])];
        arr[index] = value;
        return { ...prev, [key]: arr };
      });
    },
    [],
  );

  const addCategorySlot = useCallback((category: ActivityCategory) => {
    setDraft((prev) => {
      const key = `${category}Activities` as keyof Draft;
      const arr = [...(prev[key] as string[]), ""];
      return { ...prev, [key]: arr };
    });
  }, []);

  const updatePlannedAction = useCallback(
    (index: number, field: "activity" | "when", value: string) => {
      setDraft((prev) => {
        const actions = [...prev.plannedActions];
        actions[index] = { ...actions[index], [field]: value };
        return { ...prev, plannedActions: actions };
      });
    },
    [],
  );

  if (isComplete) {
    return (
      <CompletionScreen
        draft={draft}
        allActivities={allActivities}
        onReset={handleReset}
      />
    );
  }

  const Icon = currentStep.icon;

  return (
    <section className="rounded-b-3xl border border-slate-200 dark:border-slate-800 bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-none dark:bg-transparent shadow-sm">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-none dark:bg-slate-950/50 dark:backdrop-blur-md px-5 py-6 sm:px-7 sm:py-8">
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
              CBT
            </span>
            <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              15 Min
            </span>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Step{" "}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {currentStepIndex + 1}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-600">/{STEPS.length}</span>
            </div>
          </div>
        </div>

        {/* Main content row */}
        <div className="mt-6 flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-teal-600">
            <Activity size={22} className="text-white" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Behavioral Activation
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Plan small, values-aligned actions to restore forward momentum and
              improve mood through measurable daily wins.
            </p>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="px-5 py-5 sm:px-7">
        {/* Progress bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
            <span>Session Progress</span>
            <span className="dark:text-slate-400">{progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Current focus</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {currentStep.title}
            </span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const done = index < currentStepIndex;

            return (
              <div
                key={step.id}
                className={`rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  index === currentStepIndex
                    ? "border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 ring-1 ring-teal-100 dark:ring-teal-900/30"
                    : done
                      ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <CircleDashed size={13} />
                  )}
                  <StepIcon size={13} />
                  <span className="truncate">{step.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active step content */}
        <section className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Current Step
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                <Icon size={20} className="text-teal-600 dark:text-teal-500" />
                {currentStep.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {currentStep.prompt}
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                canMoveNext
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
              }`}
            >
              {canMoveNext ? "Ready" : "Input Required"}
            </span>
          </div>

          <div className="mt-4">
            <StepContent
              stepId={currentStep.id}
              draft={draft}
              allActivities={allActivities}
              onDraftChange={setDraft}
              onUpdateCategoryActivity={updateCategoryActivities}
              onAddCategorySlot={addCategorySlot}
              onUpdatePlannedAction={updatePlannedAction}
            />
          </div>
        </section>

        {/* Navigation */}
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {canMoveNext
              ? "Requirement met. Continue when ready."
              : "Complete the current step to proceed."}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canMoveNext}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-teal-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 dark:hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
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

/* ─────────────────────── step content ─────────────────────── */

function StepContent({
  stepId,
  draft,
  allActivities,
  onDraftChange,
  onUpdateCategoryActivity,
  onAddCategorySlot,
  onUpdatePlannedAction,
}: {
  stepId: StepId;
  draft: Draft;
  allActivities: ActivityEntry[];
  onDraftChange: React.Dispatch<React.SetStateAction<Draft>>;
  onUpdateCategoryActivity: (
    category: ActivityCategory,
    index: number,
    value: string,
  ) => void;
  onAddCategorySlot: (category: ActivityCategory) => void;
  onUpdatePlannedAction: (
    index: number,
    field: "activity" | "when",
    value: string,
  ) => void;
}) {
  if (stepId === "mood") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Take a moment. How does your body feel? What emotions are present?
            There is no wrong answer.
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
            Current Mood
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">
            How would you rate your mood right now?
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>0 Low</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {draft.moodRating}/10
            </span>
            <span>10 Great</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={draft.moodRating}
            onChange={(e) =>
              onDraftChange((prev) => ({
                ...prev,
                moodRating: Number(e.target.value),
              }))
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-800 accent-teal-600 dark:accent-teal-500"
          />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
            Describe How You Feel
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">
            A sentence or two about your current emotional state.
          </p>
        </div>
        <textarea
          value={draft.moodNote}
          onChange={(e) =>
            onDraftChange((prev) => ({ ...prev, moodNote: e.target.value }))
          }
          placeholder='Example: "I feel tired and a bit overwhelmed, but not as bad as yesterday."'
          className="min-h-24 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-teal-200 dark:focus:border-teal-900/50 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/20"
        />
      </div>
    );
  }

  if (stepId === "brainstorm") {
    const categories: ActivityCategory[] = ["pleasure", "mastery", "social"];
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Think of small, realistic activities you could do today or this
            week. Add at least one per category. These do not need to be big —
            even 5-minute actions count.
          </p>
        </div>

        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const CatIcon = meta.icon;
          const key = `${cat}Activities` as keyof Draft;
          const list = draft[key] as string[];

          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border ${meta.color}`}
                >
                  <CatIcon size={14} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {meta.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-600">{meta.hint}</p>
                </div>
              </div>

              {list.map((val, idx) => (
                <input
                  key={`${cat}-${idx}`}
                  type="text"
                  value={val}
                  onChange={(e) =>
                    onUpdateCategoryActivity(cat, idx, e.target.value)
                  }
                  placeholder={
                    cat === "pleasure"
                      ? "e.g. Listen to my favorite playlist"
                      : cat === "mastery"
                        ? "e.g. Organize my desk for 10 minutes"
                        : "e.g. Text a friend to check in"
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-teal-200 dark:focus:border-teal-900/50 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/20"
                />
              ))}

              <button
                type="button"
                onClick={() => onAddCategorySlot(cat)}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 transition-colors hover:text-teal-700 dark:hover:text-teal-300"
              >
                + Add another {meta.label.toLowerCase()} activity
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  if (stepId === "plan") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Select up to 3 activities from your brainstorm and assign a specific
            time. Being specific increases follow-through by 2–3×.
          </p>
        </div>

        {allActivities.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
              Your Brainstormed Activities
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {allActivities.map((entry, idx) => {
                const meta = CATEGORY_META[entry.category];
                const isSelected = draft.plannedActions.some(
                  (a) => a.activity === entry.text,
                );
                return (
                  <button
                    key={`pick-${idx}`}
                    type="button"
                    onClick={() => {
                      if (isSelected) return;
                      const emptyIdx = draft.plannedActions.findIndex(
                        (a) => a.activity.trim().length === 0,
                      );
                      if (emptyIdx !== -1) {
                        onUpdatePlannedAction(emptyIdx, "activity", entry.text);
                      }
                    }}
                    disabled={isSelected}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                        : `${meta.color} hover:opacity-80`
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 size={11} className="mr-1 inline" />
                    )}
                    {entry.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {draft.plannedActions.map((action, idx) => (
            <div
              key={`action-${idx}`}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Action {idx + 1}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={action.activity}
                  onChange={(e) =>
                    onUpdatePlannedAction(idx, "activity", e.target.value)
                  }
                  placeholder="What will you do?"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-teal-200 dark:focus:border-teal-900/50 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/20"
                />
                <input
                  type="text"
                  value={action.when}
                  onChange={(e) =>
                    onUpdatePlannedAction(idx, "when", e.target.value)
                  }
                  placeholder="When? (e.g. Today at 3pm)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-teal-200 dark:focus:border-teal-900/50 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/20"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* commitment step */
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Review your plan below. Rate how confident you feel about following
          through, and optionally write a note of self-encouragement.
        </p>
      </div>

      {/* Plan summary */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Your Action Plan
        </p>
        <ul className="mt-3 space-y-2">
          {draft.plannedActions
            .filter((a) => a.activity.trim().length > 0)
            .map((action, idx) => (
              <li
                key={`summary-${idx}`}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-teal-500 dark:text-teal-400"
                />
                <span>
                  <strong className="dark:text-white">{action.activity}</strong>
                  {action.when ? ` — ${action.when}` : ""}
                </span>
              </li>
            ))}
          {draft.plannedActions.every(
            (a) => a.activity.trim().length === 0,
          ) && (
            <li className="text-sm text-slate-400 dark:text-slate-600">
              No actions planned yet. Go back and add some.
            </li>
          )}
        </ul>
      </div>

      {/* Confidence */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
          Confidence Level
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">
          How confident are you that you will follow through?
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>0 Low</span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {draft.confidenceRating}/10
          </span>
          <span>10 Very Confident</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={draft.confidenceRating}
          onChange={(e) =>
            onDraftChange((prev) => ({
              ...prev,
              confidenceRating: Number(e.target.value),
            }))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-800 accent-teal-600 dark:accent-teal-500"
        />
      </div>

      {/* Encouragement note */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
          Self-Encouragement Note
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">
          Optional. Write something kind to future you.
        </p>
      </div>
      <textarea
        value={draft.encouragementNote}
        onChange={(e) =>
          onDraftChange((prev) => ({
            ...prev,
            encouragementNote: e.target.value,
          }))
        }
        placeholder='Example: "Even one small step today counts. You are trying, and that matters."'
        className="min-h-20 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-teal-200 dark:focus:border-teal-900/50 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/20"
      />
    </div>
  );
}

/* ─────────────────────── completion screen ─────────────────────── */

function CompletionScreen({
  draft,
  allActivities,
  onReset,
}: {
  draft: Draft;
  allActivities: ActivityEntry[];
  onReset: () => void;
}) {
  const activeActions = draft.plannedActions.filter(
    (a) => a.activity.trim().length > 0,
  );

  return (
    <section className="rounded-b-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 dark:backdrop-blur-md px-5 py-6 sm:px-7 sm:py-8">
        <Link
          href="/exercises"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
        >
          <ArrowLeft size={12} />
          Exercises
        </Link>
        <div className="mt-5 flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
            <CheckCircle2 size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Your Activation Plan
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              You have built an actionable plan to improve your mood through
              meaningful activities.
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-5 sm:px-7">
        {/* Success banner */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Plan Created
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Small, consistent actions build momentum. You don&apos;t need to
            feel motivated first — the mood improvement follows the action.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {/* Mood check-in */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Mood at Session Start
            </p>
            <p className="mt-2 text-2xl font-bold text-teal-600 dark:text-teal-400">
              {draft.moodRating}/10
            </p>
            {draft.moodNote && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">
                &ldquo;{draft.moodNote}&rdquo;
              </p>
            )}
          </div>

          {/* Brainstormed activities */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Activities Brainstormed
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {allActivities.map((entry, idx) => {
                const meta = CATEGORY_META[entry.category];
                return (
                  <span
                    key={`complete-act-${idx}`}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${meta.color}`}
                  >
                    {entry.text}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Planned actions */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Committed Actions
            </p>
            <ul className="mt-3 space-y-2">
              {activeActions.map((action, idx) => (
                <li
                  key={`done-${idx}`}
                  className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <CalendarCheck
                    size={14}
                    className="mt-0.5 shrink-0 text-teal-500 dark:text-teal-400"
                  />
                  <span>
                    <strong className="dark:text-white">{action.activity}</strong>
                    {action.when ? ` — ${action.when}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Confidence & encouragement */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Confidence
            </p>
            <p className="mt-2 text-2xl font-bold text-teal-600 dark:text-teal-400">
              {draft.confidenceRating}/10
            </p>
            {draft.encouragementNote && (
              <div className="mt-3 rounded-lg border border-teal-100 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 px-3 py-2 text-sm text-teal-700 dark:text-teal-400 italic">
                &ldquo;{draft.encouragementNote}&rdquo;
              </div>
            )}
          </div>
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
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Crosshair size={13} />
            Return to Exercises
          </Link>
        </div>
      </div>
    </section>
  );
}
