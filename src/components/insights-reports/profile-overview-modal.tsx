"use client";

import {
  Brain,
  ChevronRight,
  LoaderCircle,
  MessageSquareHeart,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import type { ProfileOverviewSummaryResponse } from "@/api/profile";

type ProfileOverviewModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  data: ProfileOverviewSummaryResponse | null;
  onClose: () => void;
};

export default function ProfileOverviewModal({
  isOpen,
  isLoading,
  error,
  data,
  onClose,
}: ProfileOverviewModalProps) {
  if (!isOpen) {
    return null;
  }

  const insights = data?.insights;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-overview-title"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_35%),linear-gradient(135deg,#f8fffe_0%,#f8fafc_55%,#ffffff_100%)] dark:bg-none dark:bg-slate-900 px-6 py-6">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white dark:bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-400 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Overview Intelligence
              </div>
              <h2
                id="profile-overview-title"
                className="mt-4 text-[1.85rem] font-semibold tracking-tight text-slate-950 dark:text-slate-100"
              >
                Client Overview & Insights
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Comprehensive analysis of client resilience patterns, emotional distribution, behavioral trends, and recommendation signals for therapeutic planning.
              </p>
            </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2 text-slate-400 shadow-sm transition-colors hover:bg-white dark:bg-slate-900 hover:text-slate-700 dark:text-slate-300"
            aria-label="Close overview modal"
          >
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-none dark:bg-slate-950 px-6 py-6">
          {isLoading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shadow-sm">
                <LoaderCircle className="h-6 w-6 animate-spin" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Building your overview
                </p>
                <p className="text-sm">
                  Pulling together the latest emotional and behavioral signals.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  No overview available yet
                </p>
                <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  There is no overview summary generated for this profile yet. Check back after more sessions have been logged.
                </p>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Snapshot
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                    {insights.sections[0]?.title || "Personalized emotional overview"}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {insights.sections[0]?.content ||
                      "A concise summary of what is shaping your recent emotional patterns."}
                  </p>
                </section>

                <section className="grid gap-3">
                  <SummaryCard
                    icon={<Brain className="h-4 w-4" />}
                    label="Overall Tone"
                    value={formatToken(insights.overall_tone)}
                    accentClass="from-sky-50 dark:from-sky-900/20 to-white dark:to-slate-800 text-sky-700 dark:text-sky-400"
                  />
                  <SummaryCard
                    icon={<MessageSquareHeart className="h-4 w-4" />}
                    label="Recommended Approach"
                    value={formatToken(insights.recommended_companion_approach)}
                    accentClass="from-teal-50 dark:from-teal-900/20 to-white dark:to-slate-800 text-teal-700 dark:text-teal-400"
                  />
                  <SummaryCard
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Generated"
                    value={formatGeneratedAt(insights.generated_at)}
                    accentClass="from-amber-50 dark:from-amber-900/20 to-white dark:to-slate-800 text-amber-700 dark:text-amber-400"
                  />
                </section>
              </div>

              <section className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Key Signals
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Structured themes extracted from your current profile context.
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-400">
                    {insights.sections.length} sections
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {insights.sections.map((section, index) => (
                    <article
                      key={`${section.title}-${index}`}
                      className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-none dark:bg-slate-800/40 dark:hover:bg-slate-800 px-4 py-4 transition-colors hover:border-slate-300 dark:border-slate-700"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">
                              {section.title || `Insight ${index + 1}`}
                            </h3>
                            {section.flag ? (
                              <span className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
                                {formatToken(section.flag)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                            {section.content}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 hidden h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 sm:block" />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-10 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
              No profile overview summary is available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatToken(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "recently";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SummaryCard({
  icon,
  label,
  value,
  accentClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentClass: string;
}) {
  return (
    <article
      className={`rounded-[24px] border border-slate-200 dark:border-slate-800 bg-gradient-to-br ${accentClass} px-4 py-4 shadow-sm`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-base font-semibold text-slate-950 dark:text-slate-100">{value}</p>
    </article>
  );
}
