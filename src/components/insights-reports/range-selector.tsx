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
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
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
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}
