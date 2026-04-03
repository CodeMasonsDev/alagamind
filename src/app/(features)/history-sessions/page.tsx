import type { ReactNode } from "react";
import {
  Dumbbell,
  History,
} from "lucide-react";
import {
  PageHeader,
  SectionHeading,
  StatusPill,
  SurfaceCard,
} from "@/components/features/insights-sessions/shared";
import { historySessionsMockData } from "@/lib/mock-insights-sessions";

export default function HistorySessionsPage() {
  const data = historySessionsMockData;
  const maxThemeSessions = Math.max(...data.themes.map((theme) => theme.sessions));

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <PageHeader
          eyebrow="History & Sessions"
          title="Conversation, reframe, and protocol logs"
          description="Prototype-only UI for session history and traceability. The structure is ready for real backend data, but every number and record on this screen is static placeholder content for visual review."
          actions={<StatusPill tone="teal">Prototype data only</StatusPill>}
          metrics={[
            {
              label: "Sessions this month",
              value: String(data.summary.sessionsThisMonth),
              detail: "AI companion conversations captured in the current window.",
              tone: "teal",
            },
            {
              label: "Average turns",
              value: String(data.summary.averageTurns),
              detail: "Mean back-and-forth depth across recent sessions.",
              tone: "violet",
            },
            {
              label: "Saved reframes",
              value: String(data.summary.savedReframes),
              detail: "Total reframes retained from guided work.",
              tone: "amber",
            },
            {
              label: "Protocols completed",
              value: String(data.summary.protocolsCompleted),
              detail: `${data.summary.languagesTracked} languages surfaced in recent conversations.`,
              tone: "rose",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="AI Companion"
                title="Session Log"
                description="Past conversations with date, turn count, dominant emotion, language, and a short intent-level summary."
              />
              <StatusPill tone="teal">Conversation history</StatusPill>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-4">Session</th>
                    <th className="px-4">Date</th>
                    <th className="px-4">Turns</th>
                    <th className="px-4">Emotion</th>
                    <th className="px-4">Language</th>
                    <th className="px-4">Theme</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessionLog.map((session) => (
                    <tr key={session.id} className="rounded-2xl bg-white">
                      <td className="rounded-l-2xl border-y border-l border-slate-200 px-4 py-4 align-top">
                        <p className="font-semibold text-slate-950">
                          {session.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {session.summary}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {session.id}
                        </p>
                      </td>
                      <td className="border-y border-slate-200 px-4 py-4 text-sm text-slate-600">
                        {session.date}
                      </td>
                      <td className="border-y border-slate-200 px-4 py-4 text-sm font-semibold text-slate-700">
                        {session.turnCount}
                      </td>
                      <td className="border-y border-slate-200 px-4 py-4">
                        <EmotionPill emotion={session.dominantEmotion} />
                      </td>
                      <td className="border-y border-slate-200 px-4 py-4 text-sm text-slate-600">
                        {session.language}
                      </td>
                      <td className="rounded-r-2xl border-y border-r border-slate-200 px-4 py-4">
                        <StatusPill tone="slate">{session.theme}</StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="Intent classification"
                title="Session Themes"
                description="The topics that surfaced most often across recent companion conversations."
              />
              <StatusPill tone="violet">Theme frequency</StatusPill>
            </div>

            <div className="mt-6 space-y-4">
              {data.themes.map((theme) => (
                <article
                  key={theme.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {theme.label}
                      </p>
                      <p className="text-sm text-slate-500">{theme.note}</p>
                    </div>
                    <StatusPill tone={directionTone(theme.direction)}>
                      {theme.direction}
                    </StatusPill>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{
                        width: `${clampPercent(
                          (theme.sessions / Math.max(maxThemeSessions, 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {theme.sessions} sessions
                  </p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="Saved work"
                title="Reframe History"
                description="All saved reframes with distortion type, tone, original thought, and the reframed alternative."
              />
              <StatusPill tone="amber">Saved reframes</StatusPill>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {data.reframeHistory.map((item) => (
                <article
                  key={`${item.savedAt}-${item.originalThought}`}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone="slate">{item.distortion}</StatusPill>
                    <StatusPill tone={toneTone(item.tone)}>{item.tone}</StatusPill>
                  </div>

                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Original thought
                  </p>
                  <p className="mt-2 text-base leading-7 text-slate-900">
                    {item.originalThought}
                  </p>

                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Saved reframe
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.reframe}
                  </p>

                  <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.savedAt}
                  </p>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="Protocols"
                title="Exercise Completion Log"
                description="Which exercises were completed, how often they are being used, and the latest observed result."
              />
              <StatusPill tone="rose">Protocol usage</StatusPill>
            </div>

            <div className="mt-6 space-y-4">
              {data.exerciseLog.map((item) => (
                <article
                  key={`${item.protocol}-${item.completedAt}`}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {item.protocol}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.completedAt}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Duration
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {item.duration}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <LogMeta
                      icon={<History className="h-4 w-4" />}
                      label="Usage frequency"
                      value={item.frequency}
                    />
                    <LogMeta
                      icon={<Dumbbell className="h-4 w-4" />}
                      label="Observed outcome"
                      value={item.outcome}
                    />
                  </div>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}

function EmotionPill({ emotion }: { emotion: string }) {
  const tone = emotionTone(emotion);

  return <StatusPill tone={tone}>{emotion}</StatusPill>;
}

function LogMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">{icon}</div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function emotionTone(emotion: string): "teal" | "amber" | "rose" | "violet" {
  const normalizedEmotion = emotion.toLowerCase();

  if (
    normalizedEmotion.includes("calm") ||
    normalizedEmotion.includes("focused")
  ) {
    return "teal";
  }

  if (
    normalizedEmotion.includes("tired") ||
    normalizedEmotion.includes("pressured") ||
    normalizedEmotion.includes("nervous")
  ) {
    return "amber";
  }

  if (
    normalizedEmotion.includes("hurt") ||
    normalizedEmotion.includes("anxious")
  ) {
    return "rose";
  }

  return "violet";
}

function directionTone(
  direction: "rising" | "steady" | "cooling",
): "amber" | "slate" | "teal" {
  if (direction === "rising") {
    return "amber";
  }

  if (direction === "cooling") {
    return "teal";
  }

  return "slate";
}

function toneTone(
  tone: "Logical" | "Compassionate" | "Direct",
): "slate" | "rose" | "amber" {
  if (tone === "Compassionate") {
    return "rose";
  }

  if (tone === "Direct") {
    return "amber";
  }

  return "slate";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
