import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Flame,
  Sparkles,
} from "lucide-react";
import PrintReportButton from "@/components/features/insights-sessions/print-report-button";
import {
  PageHeader,
  SectionHeading,
  StatusPill,
  SurfaceCard,
  TrendLineChart,
} from "@/components/features/insights-sessions/shared";
import { insightsReportsMockData } from "@/lib/mock-insights-sessions";

const heatmapToneStyles = [
  "border-slate-200 bg-slate-100 text-slate-500",
  "border-teal-100 bg-teal-50 text-teal-700",
  "border-amber-100 bg-amber-50 text-amber-700",
  "border-violet-100 bg-violet-50 text-violet-700",
  "border-rose-100 bg-rose-50 text-rose-700",
];

export default function InsightsReportsPage() {
  const data = insightsReportsMockData;
  const activityTotals = data.activitySummary.weeklyCounts.reduce(
    (totals, week) => ({
      checkIns: totals.checkIns + week.checkIns,
      journals: totals.journals + week.journals,
      reframes: totals.reframes + week.reframes,
      exercises: totals.exercises + week.exercises,
    }),
    { checkIns: 0, journals: 0, reframes: 0, exercises: 0 },
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <PageHeader
          eyebrow="Insights & Reports"
          title="Longitudinal wellbeing analytics"
          description="Prototype-only UI for trends, report cards, and therapy-facing summaries. Every value on this screen is static dummy data so you can review layout, density, and hierarchy before wiring real models and endpoints."
          actions={
            <>
              <StatusPill tone="teal">Prototype data only</StatusPill>
              <PrintReportButton />
            </>
          }
          metrics={[
            {
              label: "Current RQ Score",
              value: String(data.summary.currentRqScore),
              detail: `Up ${data.summary.rqDelta} points from the prior week.`,
              tone: "teal",
            },
            {
              label: "Top Emotion",
              value: data.summary.topEmotion,
              detail: "Most frequent mood state across this weekly window.",
              tone: "violet",
            },
            {
              label: "Active Streak",
              value: `${data.summary.streakDays} days`,
              detail: "Daily check-ins are the strongest consistency signal.",
              tone: "amber",
            },
            {
              label: "Journal Sentiment",
              value: data.summary.sentimentRatio,
              detail: "Positive versus negative sentence ratio this month.",
              tone: "rose",
            },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="Check-ins"
                title="Emotional Trends"
                description="Mood over time, with the most frequent emotion surfaced for each day in the current preview week."
              />
              <StatusPill tone="teal">Mood over time</StatusPill>
            </div>

            <div className="mt-6">
              <TrendLineChart
                points={data.emotionalTrends.moodCurve.map((point) => ({
                  label: point.label,
                  value: point.value,
                  caption: point.dominantEmotion,
                }))}
                min={30}
                max={80}
                strokeColor="#0f766e"
                fillColor="rgba(15, 118, 110, 0.14)"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.emotionalTrends.moodCurve.map((point) => (
                <article
                  key={`${point.label}-${point.dateLabel}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {point.dateLabel}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {point.dominantEmotion}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Intensity index {point.value}
                  </p>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              eyebrow="Frequency"
              title="Dominant Emotion Snapshot"
              description="A compact view for the most frequent emotion today, across the week, and the hourly intensity distribution."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <CompactSummaryCard
                icon={<Clock className="h-4 w-4" />}
                label="Most frequent today"
                value={data.emotionalTrends.dailyDominantEmotion}
                detail="Latest check-in cluster"
              />
              <CompactSummaryCard
                icon={<Activity className="h-4 w-4" />}
                label="Most frequent this week"
                value={data.emotionalTrends.weeklyDominantEmotion}
                detail="Weekly leader across check-ins"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  Intensity heatmap by hour
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  From check-ins
                </p>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {data.emotionalTrends.hourlyHeatmap.map((cell) => (
                  <div
                    key={cell.hour}
                    title={`${cell.hour}:00 · ${cell.emotion}`}
                    className={`rounded-2xl border p-3 ${heatmapToneStyles[cell.intensity - 1]}`}
                  >
                    <p className="text-xs font-semibold">{cell.hour}:00</p>
                    <p className="mt-2 text-sm">{cell.emotion}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <LegendChip label="Low" tone="slate" />
                <LegendChip label="Mild" tone="teal" />
                <LegendChip label="Moderate" tone="amber" />
                <LegendChip label="High" tone="violet" />
                <LegendChip label="Peak" tone="rose" />
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="Resilience Quotient"
                title="RQ Score History"
                description="Score movement over time, with the current week decomposed into the weighted components you specified."
              />
              <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Current score
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {data.summary.currentRqScore}
                </p>
                <p className="mt-1 text-sm text-teal-700">
                  +{data.summary.rqDelta} this week
                </p>
              </div>
            </div>

            <div className="mt-6">
              <TrendLineChart
                points={data.rqHistory.curve.map((point) => ({
                  label: point.label,
                  value: point.value,
                  caption: point.note,
                }))}
                min={50}
                max={80}
                strokeColor="#0f172a"
                fillColor="rgba(15, 23, 42, 0.08)"
              />
            </div>

            <div className="mt-6 space-y-4">
              {data.rqHistory.components.map((component) => (
                <article
                  key={component.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {component.label}
                      </p>
                      <p className="text-sm text-slate-500">{component.note}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {component.current}/{component.weight} pts
                    </p>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{
                        width: `${clampPercent(
                          (component.current / component.weight) * 100,
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                    Weighted share: {component.weight}%
                  </p>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="Reframing Lab"
                title="Cognitive Distortion Report"
                description="Top distortions for the month, plus whether the pattern looks like it is cooling down or still repeating."
              />
              <StatusPill tone="amber">Month view</StatusPill>
            </div>

            <div className="mt-6 space-y-4">
              {data.distortionReport.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-950">
                      {item.label}
                    </p>
                    <StatusPill
                      tone={item.trend === "improving" ? "teal" : "rose"}
                    >
                      {item.trend}
                    </StatusPill>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.note}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span>{item.count} detections</span>
                    <span>{item.change}</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        item.trend === "improving" ? "bg-teal-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${clampPercent(item.share)}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionHeading
                eyebrow="Journals"
                title="Journal Sentiment Summary"
                description="Positive versus negative sentence ratio over time, presented as a lightweight preview of the XLM-RoBERTa sentiment layer."
              />
              <StatusPill tone="violet">XLM-RoBERTa preview</StatusPill>
            </div>

            <div className="mt-6 space-y-4">
              {data.journalSentiment.map((week) => (
                <article
                  key={week.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {week.label}
                      </p>
                      <p className="text-sm text-slate-500">{week.note}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {week.positive}% / {week.negative}%
                    </p>
                  </div>

                  <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-teal-500"
                      style={{ width: `${clampPercent(week.positive)}%` }}
                    />
                    <div
                      className="h-full bg-rose-400"
                      style={{ width: `${clampPercent(week.negative)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                    <span>Positive</span>
                    <span>Negative</span>
                  </div>
                </article>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeading
              eyebrow="Consistency"
              title="Activity Summary"
              description="Weekly counts for check-ins, journals, reframes, and exercises, followed by streak history."
            />

            <div className="mt-6 space-y-4">
              {data.activitySummary.weeklyCounts.map((week) => (
                <article
                  key={week.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-slate-950">
                      {week.label}
                    </p>
                    <p className="text-sm text-slate-500">
                      {week.checkIns +
                        week.journals +
                        week.reframes +
                        week.exercises}{" "}
                      total actions
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <ActivityRow
                      color="bg-slate-900"
                      label="Check-ins"
                      value={week.checkIns}
                      max={activityTotals.checkIns}
                    />
                    <ActivityRow
                      color="bg-teal-500"
                      label="Journals"
                      value={week.journals}
                      max={activityTotals.journals}
                    />
                    <ActivityRow
                      color="bg-violet-500"
                      label="Reframes"
                      value={week.reframes}
                      max={activityTotals.reframes}
                    />
                    <ActivityRow
                      color="bg-amber-500"
                      label="Exercises"
                      value={week.exercises}
                      max={activityTotals.exercises}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {data.activitySummary.streaks.map((streak) => (
                <article
                  key={streak.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {streak.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    {streak.current}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Best: {streak.best}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {streak.note}
                  </p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          id="weekly-report-card"
          className="print:border-slate-400 print:shadow-none"
        >
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Weekly Report Card
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Therapist-ready summary
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Week of {data.weeklyReportCard.weekRange}. This is formatted as
                a single exportable snapshot with concise, human-readable
                observations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="amber">Dummy export view</StatusPill>
              <PrintReportButton label="Print this page" />
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <ReportStat
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="RQ score"
                  value={String(data.weeklyReportCard.rqScore)}
                  detail={`+${data.weeklyReportCard.delta} versus last week`}
                />
                <ReportStat
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Top emotion"
                  value={data.weeklyReportCard.topEmotion}
                  detail="Most frequent emotion this week"
                />
                <ReportStat
                  icon={<Brain className="h-4 w-4" />}
                  label="Top distortion"
                  value={data.weeklyReportCard.topDistortion}
                  detail="Most common distortion in reframing data"
                />
                <ReportStat
                  icon={<Flame className="h-4 w-4" />}
                  label="Streak"
                  value={`${data.weeklyReportCard.streak} days`}
                  detail="Current consecutive check-in streak"
                />
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Care signals
                </p>
                <div className="mt-4 space-y-3">
                  {data.weeklyReportCard.careSignals.map((signal) => (
                    <div
                      key={signal.label}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone={signal.tone}>{signal.label}</StatusPill>
                        <p className="text-sm font-medium text-slate-900">
                          {signal.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <p className="text-lg font-semibold text-slate-950">
                    Therapist summary
                  </p>
                </div>
                <ol className="mt-5 space-y-4">
                  {data.weeklyReportCard.therapistSummary.map((item, index) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-600">
                      <span className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-7">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                  <p className="text-lg font-semibold text-slate-950">
                    Recommended focus
                  </p>
                </div>
                <ol className="mt-5 space-y-4">
                  {data.weeklyReportCard.recommendations.map((item, index) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-600">
                      <span className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-7">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

function CompactSummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center gap-2 text-slate-500">{icon}</div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function LegendChip({
  label,
  tone,
}: {
  label: string;
  tone: "slate" | "teal" | "amber" | "rose" | "violet";
}) {
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

function ActivityRow({
  color,
  label,
  value,
  max,
}: {
  color: string;
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${clampPercent((value / Math.max(max, 1)) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function ReportStat({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-500">{icon}</div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
