import type { ReactNode } from "react";
import { BarChart3, Flame, Target, Zap } from "lucide-react";
import type { OverviewMetrics as OverviewMetricsData } from "@/features/insights-reports/types";

export default function OverviewMetrics({
  overview,
}: {
  overview: OverviewMetricsData | null;
}) {
  const safeOverview = overview ?? {
    rq_score: 0,
    adaptive_capacity_percentage: 0,
    focus_streak_days: 0,
    total_activity_count: 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricWithIcon
        icon={<BarChart3 className="h-5 w-5" />}
        label="RQ Score"
        value={String(safeOverview.rq_score)}
        detail="Current resilience score for the selected range."
      />
      <MetricWithIcon
        icon={<Target className="h-5 w-5" />}
        label="Adaptive Capacity"
        value={`${Math.round(safeOverview.adaptive_capacity_percentage)}%`}
        detail="Raw score progress across active RQ modules."
      />
      <MetricWithIcon
        icon={<Flame className="h-5 w-5" />}
        label="Focus Streak"
        value={`${safeOverview.focus_streak_days} days`}
        detail="Current daily consistency streak."
      />
      <MetricWithIcon
        icon={<Zap className="h-5 w-5" />}
        label="Total Activity"
        value={String(safeOverview.total_activity_count)}
        detail="Combined activity count in the selected period."
      />
    </div>
  );
}

function MetricWithIcon({
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">{icon}</div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}
