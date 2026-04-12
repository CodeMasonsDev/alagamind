import { DistributionBar } from "./chart-primitives";
import {
  EmptySectionCopy,
  InsightsPill,
  InsightsReportsSection,
} from "./ui";
import type { DistortionsSummaryResponse } from "@/features/insights-reports/types";

const BAR_COLORS = [
  "bg-amber-400",
  "bg-sky-400",
  "bg-violet-400",
  "bg-orange-400",
  "bg-stone-400",
  "bg-slate-400",
];

export default function DistortionAnalysis({
  distortionsSummary,
}: {
  distortionsSummary: DistortionsSummaryResponse | null;
}) {
  const dominant = distortionsSummary?.dominant_distortion ?? null;
  const breakdown = distortionsSummary?.breakdown ?? [];

  return (
    <InsightsReportsSection
      eyebrow="Cognitive Distortion Analysis"
      title="Distortion breakdown"
      description="Detected across journal entries and reframing sessions."
      aside={
        dominant ? (
          <InsightsPill tone="amber">Dominant: {dominant.label}</InsightsPill>
        ) : undefined
      }
    >
      {breakdown.length > 0 ? (
        <div className="space-y-4">
          {breakdown.map((item, index) => (
            <article
              key={item.label}
              className="grid items-center gap-4 sm:grid-cols-[180px_1fr_auto]"
            >
              <p className="text-lg font-medium text-slate-700">{item.label}</p>
              <DistributionBar
                value={item.percentage}
                colorClass={BAR_COLORS[index % BAR_COLORS.length]}
              />
              <p
                className={`text-right text-lg font-semibold ${
                  index === 0 ? "text-amber-600" : "text-slate-700"
                }`}
              >
                {Math.round(item.percentage)}%
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptySectionCopy message="No cognitive distortion breakdown is available for this range." />
      )}
    </InsightsReportsSection>
  );
}
