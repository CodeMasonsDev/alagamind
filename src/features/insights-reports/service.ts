import axiosInstance from "@/lib/axios";
import type {
  BehavioralPattern,
  CompanionInsights,
  DistortionBreakdownItem,
  DistortionsSummaryResponse,
  DistributionTag,
  EmotionalDistribution,
  EmotionalStateDistributionItem,
  ExerciseRecommendationItem,
  ExerciseRecommendations,
  InsightsReportsLoadResult,
  InsightsReportsPageData,
  InsightsReportsRange,
  InsightsReportsResponse,
  ModuleContribution,
  ModuleContributionItem,
  OverviewMetrics,
  RqHistoryResponse,
  RqSnapshot,
  WeeklyActivity,
  WeeklyActivityDay,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) {
      return fallback;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function asArray<T>(value: unknown, mapper: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(mapper) : [];
}

function pickValue(
  source: Record<string, unknown>,
  keys: string[],
): unknown | undefined {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }
  return undefined;
}

function normalizeOverview(value: unknown): OverviewMetrics | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    rq_score: asNumber(value.rq_score),
    adaptive_capacity_percentage: asNumber(
      value.adaptive_capacity_percentage,
    ),
    focus_streak_days: asNumber(value.focus_streak_days),
    total_activity_count: asNumber(value.total_activity_count),
  };
}

function normalizeRqSnapshot(value: unknown): RqSnapshot {
  const snapshot = isRecord(value) ? value : {};

  return {
    date: asString(snapshot.date),
    score: asNumber(snapshot.score),
    raw_score: asNumber(snapshot.raw_score),
    max_raw: asNumber(snapshot.max_raw),
    breakdown: isRecord(snapshot.breakdown) ? snapshot.breakdown : {},
  };
}

function normalizeRqHistory(value: unknown): RqHistoryResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    user_id: asString(value.user_id),
    range: asString(value.range),
    snapshots: asArray(value.snapshots, normalizeRqSnapshot),
  };
}

function normalizeEmotionalStateItem(
  value: unknown,
): EmotionalStateDistributionItem {
  const state = isRecord(value) ? value : {};

  return {
    state: asString(state.state),
    label: asString(state.label),
    count: asNumber(state.count),
    average_intensity: asNumber(state.average_intensity),
  };
}

function normalizeEmotionalDistribution(
  value: unknown,
): EmotionalDistribution | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    range: asString(value.range),
    total_checkins: asNumber(value.total_checkins),
    states: asArray(value.states, normalizeEmotionalStateItem),
    dominant_state: isRecord(value.dominant_state)
      ? normalizeEmotionalStateItem(value.dominant_state)
      : null,
  };
}

function normalizeWeeklyActivityDay(value: unknown): WeeklyActivityDay {
  const day = isRecord(value) ? value : {};

  return {
    date: asString(day.date),
    day_key: asString(day.day_key),
    day_label: asString(day.day_label),
    companion: asNumber(day.companion),
    journal: asNumber(day.journal),
    reframing: asNumber(day.reframing),
    total: asNumber(day.total),
  };
}

function normalizeWeeklyActivity(value: unknown): WeeklyActivity | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    week_start: asString(value.week_start),
    week_end: asString(value.week_end),
    days: asArray(value.days, normalizeWeeklyActivityDay),
  };
}

function normalizeDistortionBreakdownItem(
  value: unknown,
): DistortionBreakdownItem {
  const item = isRecord(value) ? value : {};

  return {
    label: asString(item.label),
    count: asNumber(item.count),
    percentage: asNumber(item.percentage),
  };
}

function normalizeBehavioralPattern(value: unknown): BehavioralPattern {
  const pattern = isRecord(value) ? value : {};

  return {
    type: asString(pattern.type),
    title: asString(pattern.title),
    share: asNumber(pattern.share),
    count: asNumber(pattern.count),
    severity: asNullableString(pattern.severity),
    window: asNullableString(pattern.window),
    keywords: asStringArray(pattern.keywords),
  };
}

function normalizeDistortionsSummary(
  value: unknown,
): DistortionsSummaryResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    user_id: asString(value.user_id),
    range: asString(value.range),
    total_detected: asNumber(value.total_detected),
    dominant_distortion: isRecord(value.dominant_distortion)
      ? normalizeDistortionBreakdownItem(value.dominant_distortion)
      : null,
    breakdown: asArray(value.breakdown, normalizeDistortionBreakdownItem),
    patterns: asArray(value.patterns, normalizeBehavioralPattern),
  };
}

function normalizeDistributionTag(value: unknown): DistributionTag {
  const item = isRecord(value) ? value : {};

  return {
    label: asString(item.label),
    count: asNumber(item.count),
    percentage: asNumber(item.percentage),
  };
}

function normalizeCompanionInsights(value: unknown): CompanionInsights | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    total_sessions: asNumber(value.total_sessions),
    total_turns: asNumber(value.total_turns),
    language_distribution: asArray(
      value.language_distribution,
      normalizeDistributionTag,
    ),
    emotion_tags: asArray(value.emotion_tags, normalizeDistributionTag),
    focus_tags: asArray(value.focus_tags, normalizeDistributionTag),
    frequent_tags: asArray(value.frequent_tags, normalizeDistributionTag),
  };
}

function normalizeModuleContributionItem(
  value: unknown,
): ModuleContributionItem {
  const item = isRecord(value) ? value : {};

  return {
    key: asString(
      pickValue(item, ["key", "module_key", "moduleKey", "id", "name"]),
    ),
    label: asString(
      pickValue(item, ["label", "module_label", "moduleLabel", "title", "name"]),
    ),
    weight: asNumber(
      pickValue(item, ["weight", "weight_percent", "weightPercent"]),
    ),
    actual_points: asNumber(
      pickValue(item, ["actual_points", "actualPoints", "points", "actual"]),
    ),
    max_points: asNumber(
      pickValue(item, ["max_points", "maxPoints", "maximum_points", "max"]),
    ),
    summary: asString(
      pickValue(item, ["summary", "description", "details", "subtitle"]),
    ),
    deferred: Boolean(
      pickValue(item, ["deferred", "is_deferred", "isDeferred", "defer"]),
    ),
  };
}

function normalizeModuleContribution(value: unknown): ModuleContribution | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawModules = pickValue(value, ["modules", "module_contribution", "items"]);

  return {
    current_rq_score: asNumber(
      pickValue(value, ["current_rq_score", "currentRqScore", "current_score"]),
    ),
    modules: asArray(rawModules, normalizeModuleContributionItem),
  };
}

function normalizeExerciseRecommendationItem(
  value: unknown,
): ExerciseRecommendationItem {
  const item = isRecord(value) ? value : {};

  return {
    title: asString(item.title),
    category: asString(item.category),
    match_score: asNumber(item.match_score),
    description: asString(item.description),
    duration: asString(item.duration),
    href: asString(item.href),
    reason: asString(item.reason),
    created_at: asString(item.created_at),
  };
}

function normalizeExerciseRecommendations(
  value: unknown,
): ExerciseRecommendations | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    items: asArray(value.items, normalizeExerciseRecommendationItem),
    categories: asStringArray(value.categories),
    score_source: asString(value.score_source),
  };
}

function normalizeInsightsReports(value: unknown): InsightsReportsResponse | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    user_id: asString(value.user_id),
    range: asString(value.range),
    overview: normalizeOverview(value.overview),
    rq_history: normalizeRqHistory(value.rq_history),
    emotional_distribution: normalizeEmotionalDistribution(
      value.emotional_distribution,
    ),
    weekly_activity: normalizeWeeklyActivity(value.weekly_activity),
    cognitive_distortions: normalizeDistortionsSummary(
      value.cognitive_distortions,
    ),
    companion_insights: normalizeCompanionInsights(value.companion_insights),
    behavioral_patterns: asArray(
      value.behavioral_patterns,
      normalizeBehavioralPattern,
    ),
    module_contribution: normalizeModuleContribution(value.module_contribution),
    exercise_recommendations: normalizeExerciseRecommendations(
      value.exercise_recommendations,
    ),
  };
}

export async function getInsightsReports(
  userId: string,
  range: InsightsReportsRange,
) {
  const response = await axiosInstance.get("api/insights/reports", {
    params: {
      user_id: userId,
      range,
    },
  });

  return normalizeInsightsReports(response.data);
}

export async function getRqHistory(
  userId: string,
  range: InsightsReportsRange,
) {
  const response = await axiosInstance.get("api/rq/history", {
    params: {
      user_id: userId,
      range,
    },
  });

  return normalizeRqHistory(response.data);
}

export async function getDistortionsSummary(
  userId: string,
  range: InsightsReportsRange,
) {
  const response = await axiosInstance.get("api/reframing/distortions/summary", {
    params: {
      user_id: userId,
      range,
    },
  });

  return normalizeDistortionsSummary(response.data);
}

export async function loadInsightsReportsPageData(
  userId: string,
  range: InsightsReportsRange,
): Promise<InsightsReportsLoadResult> {
  const [reportResult, rqHistoryResult, distortionsResult] =
    await Promise.allSettled([
      getInsightsReports(userId, range),
      getRqHistory(userId, range),
      getDistortionsSummary(userId, range),
    ]);

  const errors: string[] = [];
  const mergedData: InsightsReportsPageData = {
    report: null,
    rqHistory: null,
    distortionsSummary: null,
  };

  if (reportResult.status === "fulfilled") {
    mergedData.report = reportResult.value;
  } else {
    errors.push("The main insights report could not be loaded.");
  }

  if (rqHistoryResult.status === "fulfilled") {
    mergedData.rqHistory = rqHistoryResult.value ?? mergedData.report?.rq_history ?? null;
  } else {
    mergedData.rqHistory = mergedData.report?.rq_history ?? null;
    errors.push("RQ history could not be refreshed.");
  }

  if (distortionsResult.status === "fulfilled") {
    mergedData.distortionsSummary =
      distortionsResult.value ?? mergedData.report?.cognitive_distortions ?? null;
  } else {
    mergedData.distortionsSummary =
      mergedData.report?.cognitive_distortions ?? null;
    errors.push("Distortion summary could not be refreshed.");
  }

  return {
    data: mergedData,
    errors,
  };
}
