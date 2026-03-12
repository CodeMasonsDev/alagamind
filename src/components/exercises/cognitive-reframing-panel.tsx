"use client";

import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { DISTORTIONS } from "@/features/cognitive-reframing/constants";
import { useCognitiveReframing } from "@/features/cognitive-reframing/use-cognitive-reframing";

type Props = {
  className?: string;
};

export default function CognitiveReframingPanel({ className }: Props) {
  const {
    draft,
    suggestion,
    isGenerating,
    isSaving,
    hasUnsavedChanges,
    canGenerate,
    canSave,
    completionRatio,
    lastSavedAt,
    serviceMode,
    updateDraft,
    generateReframe,
    saveReframe,
    resetDraft,
  } = useCognitiveReframing();

  const completionPercent = Math.round(completionRatio * 100);
  const activeDistortion = DISTORTIONS.find(
    (distortion) => distortion.key === draft.distortion,
  );

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className ?? ""}`}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
            Cognitive Reframing
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <BrainCircuit size={20} className="text-teal-600" />
            Thought Pattern Lab
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Convert automatic threat narratives into balanced, testable
            thoughts.
          </p>
        </div>

        <div className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
            Engine
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            {serviceMode}
          </p>
        </div>
      </header>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <span>Session Completion</span>
          <span>{completionPercent}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-teal-500 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <FieldLabel
            title="Automatic Thought"
            helper="What went through your mind?"
          />
          <textarea
            value={draft.automaticThought}
            onChange={(event) =>
              updateDraft("automaticThought", event.target.value)
            }
            placeholder="Example: If I make one mistake in this meeting, everyone will think I am incompetent."
            className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
          />

          <FieldLabel
            title="Cognitive Distortion"
            helper="Pick the pattern that best fits this thought."
          />
          <div className="flex flex-wrap gap-2">
            {DISTORTIONS.map((distortion) => (
              <button
                key={distortion.key}
                type="button"
                onClick={() => updateDraft("distortion", distortion.key)}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  draft.distortion === distortion.key
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {distortion.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {activeDistortion?.hint ?? "Select one distortion pattern."}
          </p>

          <FieldLabel
            title="Distress Intensity"
            helper="How strong is the emotion right now?"
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>0 Calm</span>
              <span className="text-sm font-bold text-slate-900">
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
              onChange={(event) =>
                updateDraft("intensity", Number(event.target.value))
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-600"
            />
          </div>

          <FieldLabel
            title="Evidence Supporting The Thought"
            helper="Facts that make the thought feel true."
          />
          <textarea
            value={draft.evidenceFor}
            onChange={(event) => updateDraft("evidenceFor", event.target.value)}
            placeholder="What facts seem to support this thought?"
            className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
          />

          <FieldLabel
            title="Evidence Against The Thought"
            helper="Facts that challenge the thought."
          />
          <textarea
            value={draft.evidenceAgainst}
            onChange={(event) =>
              updateDraft("evidenceAgainst", event.target.value)
            }
            placeholder="What evidence suggests a different interpretation?"
            className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Reframing Assistant
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Generate a balanced thought + next experiment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void generateReframe()}
                disabled={!canGenerate}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles size={13} />
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>

            {suggestion ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-700">
                <CheckCircle2 size={14} />
                <span>
                  Confidence: <strong>{suggestion.confidence}%</strong> |{" "}
                  {suggestion.rationale}
                </span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                <AlertCircle size={14} />
                <span>
                  Add thought + evidence against to unlock generation.
                </span>
              </div>
            )}
          </div>

          <FieldLabel
            title="Balanced Thought"
            helper="Keep this realistic, specific, and compassionate."
          />
          <textarea
            value={draft.balancedThought}
            onChange={(event) =>
              updateDraft("balancedThought", event.target.value)
            }
            placeholder="A more balanced interpretation will appear here."
            className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
          />

          <FieldLabel
            title="Behavioral Experiment"
            helper="One action to test the new perspective today."
          />
          <textarea
            value={draft.nextAction}
            onChange={(event) => updateDraft("nextAction", event.target.value)}
            placeholder="Example: Ask one clarifying question in the meeting, then rate the actual response."
            className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:ring-2 focus:ring-teal-100"
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => void saveReframe()}
              disabled={!canSave}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={13} />
              {isSaving ? "Saving..." : "Save Reframe"}
            </button>
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw size={13} />
              Reset
            </button>

            <p className="ml-auto text-xs text-slate-500">
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
              {lastSavedAt ? ` | ${formatSavedAt(lastSavedAt)}` : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ title, helper }: { title: string; helper: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  );
}

function formatSavedAt(savedAt: string) {
  const parsed = new Date(savedAt);
  if (Number.isNaN(parsed.getTime())) return "saved";

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
