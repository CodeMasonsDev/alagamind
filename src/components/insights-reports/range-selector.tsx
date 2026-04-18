"use client";

import type { InsightsReportsRange } from "@/features/insights-reports/types";

const RANGES: InsightsReportsRange[] = ["7d", "30d", "90d"];

export default function RangeSelector({
  value,
  onChange,
  disabled,
}: {
  value: InsightsReportsRange;
  onChange: (value: InsightsReportsRange) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
      {RANGES.map((range) => {
        const active = range === value;

        return (
          <button
            key={range}
            type="button"
            disabled={disabled}
            onClick={() => onChange(range)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-slate-900 dark:bg-teal-600 text-white"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-slate-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}
