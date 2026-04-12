import {
  EmptySectionCopy,
  InsightsReportsSection,
} from "./ui";
import type { BehavioralPattern } from "@/features/insights-reports/types";

export default function BehavioralPatterns({
  patterns,
}: {
  patterns: BehavioralPattern[];
}) {
  return (
    <InsightsReportsSection
      eyebrow="Detected Behavioral Patterns"
      title="Pattern signals"
      description="Detected from entries and sessions."
    >
      {patterns.length > 0 ? (
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <article
              key={`${pattern.type}-${pattern.title}-${index}`}
              className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex gap-4">
                <span
                  className={`mt-2 h-3 w-3 rounded-full ${PATTERN_DOT_COLORS[index % PATTERN_DOT_COLORS.length]}`}
                />
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {pattern.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    {pattern.type || "Pattern"} · {pattern.count} entries analyzed
                    · {Math.round(pattern.share)}%
                    {pattern.window ? ` · ${pattern.window}` : ""}
                  </p>
                  {pattern.keywords.length > 0 ? (
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      Keywords: {pattern.keywords.join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptySectionCopy message="No detected behavioral patterns are available for this range." />
      )}
    </InsightsReportsSection>
  );
}

const PATTERN_DOT_COLORS = ["bg-amber-400", "bg-rose-500", "bg-sky-400"];
