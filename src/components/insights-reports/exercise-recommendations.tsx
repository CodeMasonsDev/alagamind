import Link from "next/link";
import {
  EmptySectionCopy,
  InsightsPill,
  InsightsReportsSection,
} from "./ui";
import type { ExerciseRecommendations as ExerciseRecommendationsData } from "@/features/insights-reports/types";

export default function ExerciseRecommendations({
  exerciseRecommendations,
}: {
  exerciseRecommendations: ExerciseRecommendationsData | null;
}) {
  const items = exerciseRecommendations?.items ?? [];

  return (
    <InsightsReportsSection
      eyebrow="Exercise Recommendations Recap"
      title="Personalized protocol matches this period"
      description="Based on the strongest current emotional state and pattern signals."
    >
      {items.length > 0 ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {items.slice(0, 3).map((item, index) => (
              <Link
                key={`${item.title}-${index}`}
                href={item.href || "/exercises"}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 transition-colors hover:bg-slate-100"
              >
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.18em] ${
                    index === 0
                      ? "text-teal-600"
                      : index === 1
                        ? "text-sky-600"
                        : "text-amber-600"
                  }`}
                >
                  {item.match_score > 0
                    ? `${Math.round(item.match_score)}% Match`
                    : item.category || "Recommended"}
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                  {item.title}
                </p>
                <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
                  {item.duration || "Flexible"} · {item.category || "Protocol"}
                </p>
                {item.reason ? (
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.reason}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex flex-wrap gap-2">
              {(exerciseRecommendations?.categories ?? []).map((category) => (
                <InsightsPill key={category} tone="slate">
                  {category}
                </InsightsPill>
              ))}
            </div>
            {exerciseRecommendations?.score_source ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Score source: {exerciseRecommendations.score_source}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <EmptySectionCopy message="No exercise recommendations are available for this range." />
      )}
    </InsightsReportsSection>
  );
}
