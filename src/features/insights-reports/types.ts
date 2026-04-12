export type InsightsReportsRange = "7d" | "30d" | "90d";

export type OverviewMetrics = {
  rq_score: number;
  adaptive_capacity_percentage: number;
  focus_streak_days: number;
  total_activity_count: number;
};

export type RqSnapshot = {
  date: string;
  score: number;
  raw_score: number;
  max_raw: number;
  breakdown: Record<string, unknown>;
};

export type RqHistoryResponse = {
  user_id: string;
  range: string;
  snapshots: RqSnapshot[];
};

export type EmotionalStateDistributionItem = {
  state: string;
  label: string;
  count: number;
  average_intensity: number;
};

export type EmotionalDistribution = {
  range: string;
  total_checkins: number;
  states: EmotionalStateDistributionItem[];
  dominant_state: EmotionalStateDistributionItem | null;
};

export type WeeklyActivityDay = {
  date: string;
  day_key: string;
  day_label: string;
  companion: number;
  journal: number;
  reframing: number;
  total: number;
};

export type WeeklyActivity = {
  week_start: string;
  week_end: string;
  days: WeeklyActivityDay[];
};

export type DistortionBreakdownItem = {
  label: string;
  count: number;
  percentage: number;
};

export type BehavioralPattern = {
  type: string;
  title: string;
  share: number;
  count: number;
  severity: string | null;
  window: string | null;
  keywords: string[];
};

export type DistortionsSummaryResponse = {
  user_id: string;
  range: string;
  total_detected: number;
  dominant_distortion: DistortionBreakdownItem | null;
  breakdown: DistortionBreakdownItem[];
  patterns: BehavioralPattern[];
};

export type DistributionTag = {
  label: string;
  count: number;
  percentage: number;
};

export type CompanionInsights = {
  total_sessions: number;
  total_turns: number;
  language_distribution: DistributionTag[];
  emotion_tags: DistributionTag[];
  focus_tags: DistributionTag[];
  frequent_tags: DistributionTag[];
};

export type ModuleContributionItem = {
  key: string;
  label: string;
  weight: number;
  actual_points: number;
  max_points: number;
  summary: string;
  deferred: boolean;
};

export type ModuleContribution = {
  current_rq_score: number;
  modules: ModuleContributionItem[];
};

export type ExerciseRecommendationItem = {
  title: string;
  category: string;
  match_score: number;
  description: string;
  duration: string;
  href: string;
  reason: string;
  created_at: string;
};

export type ExerciseRecommendations = {
  items: ExerciseRecommendationItem[];
  categories: string[];
  score_source: string;
};

export type InsightsReportsResponse = {
  user_id: string;
  range: string;
  overview: OverviewMetrics | null;
  rq_history: RqHistoryResponse | null;
  emotional_distribution: EmotionalDistribution | null;
  weekly_activity: WeeklyActivity | null;
  cognitive_distortions: DistortionsSummaryResponse | null;
  companion_insights: CompanionInsights | null;
  behavioral_patterns: BehavioralPattern[];
  module_contribution: ModuleContribution | null;
  exercise_recommendations: ExerciseRecommendations | null;
};

export type InsightsReportsPageData = {
  report: InsightsReportsResponse | null;
  rqHistory: RqHistoryResponse | null;
  distortionsSummary: DistortionsSummaryResponse | null;
};

export type InsightsReportsLoadResult = {
  data: InsightsReportsPageData;
  errors: string[];
};
