import {
  EmptySectionCopy,
  InsightsReportsSection,
  PercentageBar,
} from "./ui";
import type { ModuleContribution as ModuleContributionData } from "@/features/insights-reports/types";

export default function ModuleContribution({
  moduleContribution,
}: {
  moduleContribution: ModuleContributionData | null;
}) {
  const modules = moduleContribution?.modules ?? [];

  return (
    <InsightsReportsSection
      eyebrow="RQ Module Contribution"
      title="How each module builds your resilience score"
      description={`Weighted contribution model · Current RQ: ${moduleContribution?.current_rq_score ?? 0} / 100`}
    >
      {modules.length > 0 ? (
        <div className="space-y-5">
          {modules.map((module, index) => (
            <article
              key={module.key || module.label}
              className="grid gap-4 border-b border-slate-200 pb-5 last:border-b-0 last:pb-0 lg:grid-cols-[1fr_160px_1fr_110px]"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-2 h-3.5 w-3.5 rounded-sm ${
                    MODULE_COLORS[index % MODULE_COLORS.length]
                  }`}
                />
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">
                    {module.label}
                  </p>
                  <p className="mt-1 text-base leading-7 text-slate-500">
                    {module.summary || "No summary provided."}
                  </p>
                  {module.deferred ? (
                    <p className="mt-2 text-sm font-semibold text-amber-600">
                      Deferred in current scoring window
                    </p>
                  ) : null}
                </div>
              </div>

              <p className="text-right text-lg font-semibold text-slate-500 lg:self-center">
                {Math.round(module.weight)}% weight
              </p>

              <div className="lg:self-center">
                <PercentageBar
                  value={(module.actual_points / Math.max(module.max_points, 1)) * 100}
                  colorClass={MODULE_COLORS[index % MODULE_COLORS.length]}
                />
              </div>

              <p className="text-right text-2xl font-semibold text-slate-950 lg:self-center">
                {formatPoints(module.actual_points)} / {formatPoints(module.max_points)} pts
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptySectionCopy message="No module contribution rows are available for this range." />
      )}
    </InsightsReportsSection>
  );
}

const MODULE_COLORS = [
  "bg-[#1fa57e]",
  "bg-[#6dd5b5]",
  "bg-[#a8e0cf]",
  "bg-[#d8d7ce]",
];

function formatPoints(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
