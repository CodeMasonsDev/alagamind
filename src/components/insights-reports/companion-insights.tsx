import { DistributionBar } from "./chart-primitives";
import {
  EmptySectionCopy,
  InsightsPill,
  InsightsReportsSection,
} from "./ui";
import type { CompanionInsights as CompanionInsightsData } from "@/features/insights-reports/types";

export default function CompanionInsights({
  companionInsights,
}: {
  companionInsights: CompanionInsightsData | null;
}) {
  const languages = companionInsights?.language_distribution ?? [];
  const tags = companionInsights?.frequent_tags ?? [];

  return (
    <InsightsReportsSection
      eyebrow="Companion Insights"
      title="AI companion session summary"
      description={`${companionInsights?.total_sessions ?? 0} sessions · ${companionInsights?.total_turns ?? 0} total turns`}
    >
      {languages.length > 0 || tags.length > 0 ? (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Language usage
            </p>
            <div className="mt-3 space-y-3">
              {languages.map((language, index) => (
                <article
                  key={language.label}
                  className="grid items-center gap-4 sm:grid-cols-[140px_1fr_auto]"
                >
                  <p className="text-base font-medium text-slate-700">
                    {language.label}
                  </p>
                  <DistributionBar
                    value={language.percentage}
                    colorClass={LANGUAGE_COLORS[index % LANGUAGE_COLORS.length]}
                  />
                  <p className="text-right text-base font-semibold text-slate-700">
                    {Math.round(language.percentage)}%
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Frequent tags
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {collectFrequentTags(companionInsights).map((tag, index) => (
                <InsightsPill key={`${tag.label}-${index}`} tone={tagTone(index)}>
                  {tag.label}
                </InsightsPill>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptySectionCopy message="No companion insight tags or language distribution are available for this range." />
      )}
    </InsightsReportsSection>
  );
}

const LANGUAGE_COLORS = ["bg-[#28a37a]", "bg-[#4a90e2]", "bg-[#97978f]"];

function collectFrequentTags(companionInsights: CompanionInsightsData | null) {
  const preferred = companionInsights?.frequent_tags ?? [];

  if (preferred.length > 0) {
    return preferred;
  }

  return [
    ...(companionInsights?.emotion_tags ?? []),
    ...(companionInsights?.focus_tags ?? []),
  ].slice(0, 6);
}

function tagTone(index: number): "rose" | "amber" | "blue" | "slate" {
  const tones = ["rose", "amber", "blue", "slate"] as const;
  return tones[index % tones.length];
}
