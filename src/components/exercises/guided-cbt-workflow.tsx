"use client";

import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Save,
} from "lucide-react";
import CbtChatAssistantPanel from "./cbt-chat-assistant-panel";
import { DISTORTIONS } from "@/components/features/cognitive-reframing/constants";
import { useGuidedCbtWorkflow } from "@/components/features/cognitive-reframing/use-guided-cbt-workflow";
import { useCbtChatAssistant } from "@/components/features/cognitive-reframing/use-cbt-chat-assistant";

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
    assistantEnabled,
    toggleAssistant,
    nextStep,
    previousStep,
    updateDraft,
    generateReframe,
    saveReframe,
    setDistortion,
    setDistress,
    lastSavedAt,
  } = useGuidedCbtWorkflow();
  const chatAssistant = useCbtChatAssistant({
    isOpen: assistantEnabled,
    currentStep,
    draft,
    suggestion,
  });
  const stepRequirementMessage = isFinalStep
    ? canMoveNext
      ? "Balanced thought and behavioral experiment are ready to save."
      : validationHint
    : canMoveNext
      ? "Requirement met. Continue when ready."
      : validationHint;

  return (
    <div
      className={`relative transition-all duration-300 ${assistantEnabled ? "lg:pr-[370px]" : ""}`}
    >
      <section className="rounded-b-3xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0b1120] px-5 py-7 text-white sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">
                Guided CBT Workflow
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Cognitive Reframing Session
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Step-by-step worksheet with optional AI copilot chat on the
                right. Your input leads each step before moving forward.
              </p>
            </div>

            <div className="text-right">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
                  Step
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {currentStepIndex + 1} / {steps.length}
                </p>
              </div>
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
            <button
              type="button"
              onClick={toggleAssistant}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                assistantEnabled
                  ? "border-teal-300 bg-teal-500 text-white hover:bg-teal-600"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Bot size={13} />
              {assistantEnabled ? "Hide ReframeAI" : "ReframeAI"}
            </button>
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
                  onClick={() => void saveReframe()}
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

      <CbtChatAssistantPanel
        isOpen={assistantEnabled}
        currentStepTitle={currentStep.title}
        currentStepIndex={currentStepIndex}
        isFinalStep={isFinalStep}
        canGenerate={canGenerate}
        isGenerating={isGenerating}
        isReplying={chatAssistant.isReplying}
        messages={chatAssistant.messages}
        input={chatAssistant.input}
        quickPrompts={chatAssistant.quickPrompts}
        onClose={toggleAssistant}
        onInputChange={chatAssistant.setInput}
        onSendMessage={(value) => void chatAssistant.sendMessage(value)}
        onGenerate={() => void generateReframe()}
      />
    </div>
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
        Use the top AI Companion button to chat step-by-step. Generate balanced
        thought and behavioral experiment inside the right panel.
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
