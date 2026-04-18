"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Lightbulb,
  ShieldCheck,
  Save,
  Sparkles,
  X,
  } from "lucide-react";
import Link from "next/link";
import { DISTORTIONS } from "@/components/features/cognitive-reframing/constants";
import { useGuidedCbtWorkflow } from "@/components/features/cognitive-reframing/use-guided-cbt-workflow";
import { CognitiveReframingOverviewSummary } from "@/components/features/cognitive-reframing/types";

type StepId =
  | "automaticThought"
  | "distortion"
  | "distress"
  | "evidenceFor"
  | "evidenceAgainst"
  | "reframe";

const STEP_EXAMPLES: Record<StepId, string> = {
  automaticThought: `Example: "I am going to fail my thesis."`,
  distortion:
    "Example: Catastrophizing (assuming the worst outcome is certain).",
  distress: "Example: 7/10 means high distress but still manageable.",
  evidenceFor: "Example: I missed two deadlines this month.",
  evidenceAgainst:
    "Example: I completed similar tasks before and still have time to recover.",
  reframe:
    "Example balanced thought: I am under pressure, but I can still move forward by taking one clear step today.",
};

export default function GuidedCbtWorkflow() {
  const [overviewSummary, setOverviewSummary] =
    useState<CognitiveReframingOverviewSummary | null>(null);
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const {
    draft,
    suggestion,
    isGenerating,
    isSaving,
    hasUnsavedChanges,
    canGenerate,
    canSave,
    steps,
    currentStep,
    currentStepIndex,
    isFinalStep,
    canMoveNext,
    validationHint,
    progressPercent,
    nextStep,
    previousStep,
    updateDraft,
    generateReframe,
    saveReframe,
    setDistortion,
    setDistress,
    lastSavedAt,
  } = useGuidedCbtWorkflow();
  const stepRequirementMessage = isFinalStep
    ? canMoveNext
      ? "Balanced thought and behavioral experiment are ready to save."
      : validationHint
    : canMoveNext
      ? "Requirement met. Continue when ready."
      : validationHint;

  return (
    <div className="relative transition-all duration-300">
      <section className="rounded-b-3xl border border-slate-200 bg-white shadow-sm">
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
                CBT
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                6 Min
              </span>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Step{" "}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {currentStepIndex + 1}
                </span>
                <span className="text-xs text-slate-400">
                  /{steps.length}
                </span>
              </div>
            </div>
          </div>

          {/* Main content row */}
          <div className="mt-6 flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <BrainCircuit size={22} className="text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Cognitive Reframing Session
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
                Step-by-step worksheet to guide you through the cognitive
                reframing process. Your input leads each step before moving
                forward.
              </p>
            </div>
          </div>
        </header>

        <div className="px-5 py-5 sm:px-7">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <span>Workflow Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Current focus</span>
              <span className="font-semibold text-slate-700">
                {currentStep.title}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Complete this step first, then continue to the next one.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
                  index === currentStepIndex
                    ? "border-teal-200 bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                    : index < currentStepIndex
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  {index < currentStepIndex ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <CircleDashed size={13} />
                  )}
                  <span>
                    {index + 1}. {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Current Step
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {currentStep.title}
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

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-600">
                {STEP_EXAMPLES[currentStep.id as StepId]}
              </p>
              <p
                className={`mt-2 flex items-start gap-2 text-xs ${
                  canMoveNext ? "text-emerald-700" : "text-slate-600"
                }`}
              >
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{stepRequirementMessage}</span>
              </p>
            </div>

            <div className="mt-4">
              <StepContent
                stepId={currentStep.id}
                draft={draft}
                suggestion={suggestion}
                onUpdateDraft={updateDraft}
                onSetDistortion={setDistortion}
                onSetDistress={setDistress}
              />
            </div>
          </section>

          <footer className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">Ready to continue.</div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={previousStep}
                disabled={currentStepIndex === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Back
              </button>

              {isFinalStep ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOverviewModalOpen(true);
                    void (async () => {
                      const summary = await saveReframe();
                      if (summary) {
                        setOverviewSummary(summary);
                      }
                    })();
                  }}
                  disabled={!canSave}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Save size={13} />
                  {isSaving ? "Saving..." : "Save CBT Output"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canMoveNext}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </footer>

          {isFinalStep ? (
            <div className="mt-3 text-xs text-slate-500">
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
              {lastSavedAt ? ` | ${formatSavedAt(lastSavedAt)}` : ""}
            </div>
          ) : null}
        </div>
      </section>

      <CbtOverviewSummaryModal
        isOpen={isOverviewModalOpen}
        isLoading={isSaving && !overviewSummary}
        summary={overviewSummary}
        onClose={() => {
          setIsOverviewModalOpen(false);
          setOverviewSummary(null);
        }}
      />
    </div>
  );
}

function CbtOverviewSummaryModal({
  isOpen,
  isLoading,
  summary,
  onClose,
}: {
  isOpen: boolean;
  isLoading: boolean;
  summary: CognitiveReframingOverviewSummary | null;
  onClose: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>("distortion");

  if (!isOpen) return null;

  const togglePanel = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Dashboard Panel */}
      <div className="relative w-full max-w-2xl max-h-[95vh] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_32px_120px_-32px_rgba(15,23,42,0.5)] animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* SaaS Header - High Contrast */}
          <header className="relative border-b border-slate-200 bg-slate-900 px-8 py-8 sm:px-10">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-teal-500 blur-3xl" />
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-violet-500 blur-3xl" />
            </div>

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">
                  <BrainCircuit size={13} />
                  Clinical Insight Generated
                </div>
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Session Overview
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
                  {isLoading
                    ? "Our engine is processing your cognitive shift. One moment..."
                    : "Deep analysis of your thought reframe. Use these insights to anchor your new perspective."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-slate-700 bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>
          </header>

          {/* Dashboard Body - Accordion Toggle List */}
          <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] p-6 sm:p-10">
            <div className="mx-auto max-w-2xl space-y-3">
              <SummaryPanel
                id="distortion"
                isOpen={expandedId === "distortion"}
                onToggle={togglePanel}
                eyebrow="1. Cognitive Distortion"
                title="distortion_pattern"
                body={summary?.distortion_pattern || ""}
                tone="teal"
                icon={<Sparkles size={18} />}
                isLoading={isLoading}
              />

              <SummaryPanel
                id="analysis"
                isOpen={expandedId === "analysis"}
                onToggle={togglePanel}
                eyebrow="2. Clinical Analysis"
                title="pattern_summary"
                body={summary?.pattern_summary || ""}
                tone="violet"
                icon={<Bot size={18} />}
                isLoading={isLoading}
              />

              <SummaryPanel
                id="reframe"
                isOpen={expandedId === "reframe"}
                onToggle={togglePanel}
                eyebrow="3. Balanced Perspective"
                title="reframed_thought"
                body={summary?.reframed_thought || ""}
                tone="emerald"
                icon={<CheckCircle2 size={18} />}
                isLoading={isLoading}
              />

              <SummaryPanel
                id="confidence"
                isOpen={expandedId === "confidence"}
                onToggle={togglePanel}
                eyebrow="4. Clinical Confidence"
                title="confidence_nudge"
                body={summary?.confidence_nudge || ""}
                tone="violet"
                icon={<ShieldCheck size={18} />}
                isLoading={isLoading}
              />

              <SummaryPanel
                id="action"
                isOpen={expandedId === "action"}
                onToggle={togglePanel}
                eyebrow="5. Behavioral Step"
                title="suggested_action"
                body={summary?.suggested_action || ""}
                tone="amber"
                icon={<Lightbulb size={18} />}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* SaaS Footer */}
          <footer className="border-t border-slate-200 bg-white px-8 py-6 sm:px-10 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                  <p className="text-xs font-bold text-slate-900">Finalized</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
               
             </div>
            <button
              onClick={onClose}
              className="rounded-2xl bg-slate-900 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.98]"
            >
              Continue to Dashboard
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

function SummaryPanel({
  id,
  isOpen,
  onToggle,
  eyebrow,
  title,
  body,
  tone,
  icon,
  isLoading,
  variant = "normal",
  jsonKey,
}: {
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  eyebrow: string;
  title: string;
  body: string;
  tone: "teal" | "violet" | "emerald" | "amber";
  icon: React.ReactNode;
  isLoading?: boolean;
  variant?: "normal" | "large";
  jsonKey?: string;
}) {
  const palette =
    tone === "teal"
      ? "border-4 border-teal-100 bg-teal-50/70 text-teal-700"
      : tone === "violet"
        ? "border-4 border-violet-100 bg-violet-50/70 text-violet-700"
        : tone === "emerald"
          ? "border-4 border-emerald-100 bg-emerald-50/70 text-emerald-700"
          : "border-4 border-amber-100 bg-amber-50/70 text-amber-700";

  return (
    <section
      className={`relative cursor-pointer overflow-hidden rounded-[1.5rem] border-4 transition-all duration-300 ${
        isOpen
          ? "border-slate-400 bg-white shadow-lg p-6 sm:p-8"
          : "border-slate-200 bg-white p-5 hover:bg-slate-50/80 hover:shadow-sm"
      }`}
      onClick={() => onToggle(id)}
    >
      <div className={`flex items-start ${isOpen ? "gap-5" : "gap-4"}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ${palette} ${
            isOpen ? "h-12 w-12" : "h-10 w-10 opacitiy-80"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
               {eyebrow}
            </p>
            <div className="text-slate-400">
               <AlertCircle size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-slate-500" : ""}`} />
            </div>
          </div>
          <div className={`mt-2 transition-all duration-300 ${isOpen ? "min-h-[2rem]" : "min-h-0"}`}>
            {isLoading ? (
              <div
                className={`animate-pulse rounded bg-slate-100 ${isOpen ? "h-8 w-1/2" : "h-6 w-3/4"}`}
              />
            ) : (
              <h4
                className={`font-bold tracking-tight text-slate-900 transition-all ${
                  isOpen ? "text-xl sm:text-2xl" : "text-sm sm:text-base leading-tight"
                }`}
              >
                {title === "distortion_pattern" && !isOpen ? (
                   <span className="text-slate-500 font-semibold italic">Show Analysis</span>
                ) : (
                   title === "distortion_pattern" ? body : title
                )}
              </h4>
            )}
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isOpen ? "mt-4 max-h-[300px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm font-medium leading-8 text-slate-600">
              {title === "distortion_pattern" ? "Our clinical engine has analyzed your input." : body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepContent({
  stepId,
  draft,
  suggestion,
  onUpdateDraft,
  onSetDistortion,
  onSetDistress,
}: {
  stepId:
    | "automaticThought"
    | "distortion"
    | "distress"
    | "evidenceFor"
    | "evidenceAgainst"
    | "reframe";
  draft: {
    automaticThought: string;
    distortion: string;
    intensity: number;
    evidenceFor: string;
    evidenceAgainst: string;
    balancedThought: string;
    nextAction: string;
  };
  suggestion: { confidence: number; rationale: string } | null;
  onUpdateDraft: <
    K extends
      | "automaticThought"
      | "evidenceFor"
      | "evidenceAgainst"
      | "balancedThought"
      | "nextAction",
  >(
    key: K,
    value: string,
  ) => void;
  onSetDistortion: (value: (typeof DISTORTIONS)[number]["key"]) => void;
  onSetDistress: (value: number) => void;
}) {
  if (stepId === "automaticThought") {
    return (
      <textarea
        value={draft.automaticThought}
        onChange={(event) =>
          onUpdateDraft("automaticThought", event.target.value)
        }
        placeholder={`Example: "I am going to fail my thesis."`}
        className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
      />
    );
  }

  if (stepId === "distortion") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DISTORTIONS.map((distortion) => (
          <button
            key={distortion.key}
            type="button"
            onClick={() => onSetDistortion(distortion.key)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              draft.distortion === distortion.key
                ? "border-teal-200 bg-teal-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">
              {distortion.label}
            </p>
            <p className="mt-1 text-xs text-slate-500">{distortion.hint}</p>
          </button>
        ))}
      </div>
    );
  }

  if (stepId === "distress") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>0 Calm</span>
          <span className="text-lg font-bold text-slate-900">
            {draft.intensity}/10
          </span>
          <span>10 Distressed</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={draft.intensity}
          onChange={(event) => onSetDistress(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-600"
        />
      </div>
    );
  }

  if (stepId === "evidenceFor") {
    return (
      <textarea
        value={draft.evidenceFor}
        onChange={(event) => onUpdateDraft("evidenceFor", event.target.value)}
        placeholder="List facts that support the thought..."
        className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
      />
    );
  }

  if (stepId === "evidenceAgainst") {
    return (
      <textarea
        value={draft.evidenceAgainst}
        onChange={(event) =>
          onUpdateDraft("evidenceAgainst", event.target.value)
        }
        placeholder="List facts that challenge the thought..."
        className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Review your evidence and generate a balanced thought and behavioral
        experiment to test your new perspective.
      </div>

      {suggestion ? (
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-700">
          AI generated output is ready. Confidence {suggestion.confidence}%.
        </div>
      ) : null}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Balanced Thought
        </p>
        <textarea
          value={draft.balancedThought}
          onChange={(event) =>
            onUpdateDraft("balancedThought", event.target.value)
          }
          placeholder="Balanced, realistic interpretation..."
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Behavioral Experiment
        </p>
        <textarea
          value={draft.nextAction}
          onChange={(event) => onUpdateDraft("nextAction", event.target.value)}
          placeholder="One small action to test the new perspective..."
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
        />
      </div>
    </div>
  );
}

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "saved";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
