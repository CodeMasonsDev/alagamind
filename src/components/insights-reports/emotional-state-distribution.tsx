import { EmptySectionCopy, InsightsPill, InsightsReportsSection } from "./ui";
import type {
  EmotionalDistribution,
  EmotionalStateDistributionItem,
} from "@/features/insights-reports/types";

type CanonicalState = {
  key: string;
  label: string;
  emoji: string;
  count: number;
  averageIntensity: number;
};

const CANONICAL_STATES = [
  { key: "stressed", label: "Stressed", emoji: "😓" },
  { key: "tired", label: "Tired", emoji: "🥱" },
  { key: "focused", label: "Focused", emoji: "🎯" },
  { key: "calm", label: "Calm", emoji: "😌" },
  { key: "energized", label: "Energized", emoji: "⚡" },
] as const;

export default function EmotionalStateDistribution({
  emotionalDistribution,
}: {
  emotionalDistribution: EmotionalDistribution | null;
}) {
  const states = buildCanonicalStates(emotionalDistribution?.states ?? []);
  const dominantState = getDominantState(states);
  const hasCheckins = (emotionalDistribution?.total_checkins ?? 0) > 0;

  return (
    <InsightsReportsSection
      eyebrow="Emotional State Distribution"
      title="Check-in mood frequency"
      description={`From ${emotionalDistribution?.total_checkins ?? 0} check-ins in this range.`}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 px-2 py-2">
        {states.map((state) => (
          <article
            key={state.key}
            className={`rounded-lg border p-2 transition-colors ${
              dominantState?.key === state.key
                ? "border-teal-300 bg-teal-50"
                : "border-slate-200 bg-white"
            }`}
          >
            {/* TOP ROW */}
            <div className="flex items-center justify-between">
              <span className="text-sm">{state.emoji}</span>
              <span className="text-xs text-slate-500">{state.label}</span>
            </div>

            {/* VALUE */}
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {state.count}
            </p>

            {/* SMALL DETAIL */}
            <p className="text-[10px] text-slate-400">
              {state.count > 0
                ? formatIntensity(state.averageIntensity)
                : "No data"}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        {dominantState ? (
          <p className="text-base font-semibold text-slate-900">
            Dominant this week: {dominantState.label}{" "}
            <span className="text-slate-500">
              avg intensity {formatIntensity(dominantState.averageIntensity)}
            </span>
          </p>
        ) : hasCheckins ? (
          <InsightsPill tone="slate">No dominant state yet</InsightsPill>
        ) : (
          <EmptySectionCopy message="No emotional state distribution is available for this range." />
        )}
      </div>
    </InsightsReportsSection>
  );
}

function buildCanonicalStates(
  items: EmotionalStateDistributionItem[],
): CanonicalState[] {
  const totals = new Map<
    string,
    {
      label: string;
      emoji: string;
      count: number;
      weightedIntensity: number;
    }
  >();

  for (const state of CANONICAL_STATES) {
    totals.set(state.key, {
      label: state.label,
      emoji: state.emoji,
      count: 0,
      weightedIntensity: 0,
    });
  }

  for (const item of items) {
    const key = mapStateKey(item);
    if (!key || !totals.has(key)) {
      continue;
    }

    const current = totals.get(key);
    if (!current) {
      continue;
    }

    current.count += item.count;
    current.weightedIntensity += item.average_intensity * item.count;
  }

  return CANONICAL_STATES.map((state) => {
    const aggregate = totals.get(state.key);
    const count = aggregate?.count ?? 0;

    return {
      key: state.key,
      label: state.label,
      emoji: state.emoji,
      count,
      averageIntensity:
        count > 0 ? (aggregate?.weightedIntensity ?? 0) / count : 0,
    };
  });
}

function mapStateKey(item: EmotionalStateDistributionItem) {
  const label = item.label.trim().toLowerCase();
  const state = item.state.trim().toLowerCase();

  if (label.includes("stress") || state === "0" || state === "stressed") {
    return "stressed";
  }

  if (label.includes("tired") || state === "1" || state === "tired") {
    return "tired";
  }

  if (label.includes("focus") || state === "2" || state === "focused") {
    return "focused";
  }

  if (label.includes("calm") || state === "3" || state === "calm") {
    return "calm";
  }

  if (
    label.includes("energ") ||
    state === "4" ||
    state === "energized" ||
    state === "energised"
  ) {
    return "energized";
  }

  return null;
}

function getDominantState(states: CanonicalState[]) {
  return (
    states
      .filter((state) => state.count > 0)
      .sort((left, right) => right.count - left.count)[0] ?? null
  );
}

function formatIntensity(value: number) {
  return `${Math.round(value * 10) / 10}/10`;
}
