import type {
  InsightsReportsResponse,
  RqHistoryResponse,
  DistortionsSummaryResponse,
} from "@/features/insights-reports/types";

export type ClientStatus = "New Request" | "In Session" | "Follow-up";

export type MHPClient = {
  id: string;
  name: string;
  status: ClientStatus;
  rqScore: number;
  lastCheckin: string;
  concern: string;
};

export const MOCK_CLIENTS: MHPClient[] = [
  {
    id: "client-001",
    name: "Juan Dela Cruz",
    status: "New Request",
    rqScore: 28,
    lastCheckin: "2 days ago",
    concern: "Anxiety concern",
  },
  {
    id: "client-002",
    name: "Maria Santos",
    status: "In Session",
    rqScore: 54,
    lastCheckin: "Today",
    concern: "CBT progress tracking",
  },
  {
    id: "client-003",
    name: "Carlos Ramos",
    status: "Follow-up",
    rqScore: 42,
    lastCheckin: "1 day ago",
    concern: "Reframing progress",
  },
  {
    id: "client-004",
    name: "Ana Reyes",
    status: "In Session",
    rqScore: 61,
    lastCheckin: "Today",
    concern: "Stress management",
  },
  {
    id: "client-005",
    name: "Marco Bautista",
    status: "Follow-up",
    rqScore: 35,
    lastCheckin: "3 days ago",
    concern: "Depression screening",
  },
];

// Per-client mock insights data
const BASE_WEEKLY_DAYS = [
  { date: "2026-04-20", day_key: "mon", day_label: "Mon", companion: 1, journal: 2, reframing: 1, total: 4 },
  { date: "2026-04-21", day_key: "tue", day_label: "Tue", companion: 2, journal: 1, reframing: 0, total: 3 },
  { date: "2026-04-22", day_key: "wed", day_label: "Wed", companion: 3, journal: 2, reframing: 2, total: 7 },
  { date: "2026-04-23", day_key: "thu", day_label: "Thu", companion: 1, journal: 0, reframing: 1, total: 2 },
  { date: "2026-04-24", day_key: "fri", day_label: "Fri", companion: 0, journal: 1, reframing: 0, total: 1 },
  { date: "2026-04-25", day_key: "sat", day_label: "Sat", companion: 0, journal: 0, reframing: 0, total: 0 },
  { date: "2026-04-26", day_key: "sun", day_label: "Sun", companion: 0, journal: 0, reframing: 0, total: 0 },
];

export type MockClientInsights = {
  report: InsightsReportsResponse;
  rqHistory: RqHistoryResponse;
  distortionsSummary: DistortionsSummaryResponse;
};

const CLIENT_INSIGHTS: Record<string, MockClientInsights> = {
  "client-001": {
    report: {
      user_id: "client-001",
      range: "7d",
      overview: { rq_score: 28, adaptive_capacity_percentage: 32, focus_streak_days: 2, total_activity_count: 9 },
      rq_history: null,
      emotional_distribution: {
        range: "7d",
        total_checkins: 3,
        states: [
          { state: "stressed", label: "Stressed", count: 2, average_intensity: 7.5 },
          { state: "tired", label: "Tired", count: 1, average_intensity: 6 },
          { state: "calm", label: "Calm", count: 0, average_intensity: 0 },
          { state: "focused", label: "Focused", count: 0, average_intensity: 0 },
          { state: "energized", label: "Energized", count: 0, average_intensity: 0 },
        ],
        dominant_state: { state: "stressed", label: "Stressed", count: 2, average_intensity: 7.5 },
      },
      weekly_activity: { week_start: "2026-04-20", week_end: "2026-04-26", days: BASE_WEEKLY_DAYS },
      cognitive_distortions: null,
      companion_insights: {
        total_sessions: 3,
        total_turns: 18,
        language_distribution: [{ label: "Filipino", count: 3, percentage: 100 }],
        emotion_tags: [{ label: "Anxious", count: 5, percentage: 55 }, { label: "Overwhelmed", count: 3, percentage: 33 }],
        focus_tags: [{ label: "Work stress", count: 4, percentage: 44 }, { label: "Sleep issues", count: 3, percentage: 33 }],
        frequent_tags: [{ label: "Anxiety", count: 6, percentage: 66 }],
      },
      behavioral_patterns: [
        { type: "emotional_suppression", title: "Emotional Suppression", share: 45, count: 4, severity: "moderate", window: "7d", keywords: ["hide", "pretend", "fine"] },
        { type: "avoidance", title: "Avoidance Behavior", share: 30, count: 3, severity: "mild", window: "7d", keywords: ["avoid", "skip", "ignore"] },
      ],
      module_contribution: {
        current_rq_score: 28,
        modules: [
          { key: "journal", label: "Journaling", weight: 0.25, actual_points: 5, max_points: 25, summary: "Low journal engagement", deferred: false },
          { key: "companion", label: "AI Companion", weight: 0.3, actual_points: 8, max_points: 30, summary: "Moderate companion usage", deferred: false },
          { key: "reframing", label: "Reframing", weight: 0.2, actual_points: 3, max_points: 20, summary: "Minimal reframing done", deferred: false },
          { key: "exercises", label: "Exercises", weight: 0.25, actual_points: 12, max_points: 25, summary: "Some exercises completed", deferred: false },
        ],
      },
      exercise_recommendations: {
        items: [
          { title: "Breathing Exercise", category: "Relaxation", match_score: 0.92, description: "5-minute deep breathing to reduce anxiety", duration: "5 min", href: "/exercises", reason: "High stress detected", created_at: "2026-04-23" },
          { title: "Body Scan", category: "Mindfulness", match_score: 0.85, description: "Progressive muscle relaxation", duration: "10 min", href: "/exercises", reason: "Tension patterns noted", created_at: "2026-04-23" },
        ],
        categories: ["Relaxation", "Mindfulness"],
        score_source: "behavioral_analysis",
      },
    },
    rqHistory: {
      user_id: "client-001",
      range: "7d",
      snapshots: [
        { date: "2026-04-17", score: 24, raw_score: 24, max_raw: 100, breakdown: {} },
        { date: "2026-04-19", score: 26, raw_score: 26, max_raw: 100, breakdown: {} },
        { date: "2026-04-21", score: 25, raw_score: 25, max_raw: 100, breakdown: {} },
        { date: "2026-04-23", score: 28, raw_score: 28, max_raw: 100, breakdown: {} },
      ],
    },
    distortionsSummary: {
      user_id: "client-001",
      range: "7d",
      total_detected: 7,
      dominant_distortion: { label: "Catastrophizing", count: 3, percentage: 42 },
      breakdown: [
        { label: "Catastrophizing", count: 3, percentage: 42 },
        { label: "All-or-Nothing", count: 2, percentage: 28 },
        { label: "Mind Reading", count: 2, percentage: 28 },
      ],
      patterns: [
        { type: "catastrophizing", title: "Catastrophizing", share: 42, count: 3, severity: "moderate", window: "7d", keywords: ["worst", "ruined", "never"] },
      ],
    },
  },

  "client-002": {
    report: {
      user_id: "client-002",
      range: "7d",
      overview: { rq_score: 54, adaptive_capacity_percentage: 58, focus_streak_days: 5, total_activity_count: 21 },
      rq_history: null,
      emotional_distribution: {
        range: "7d",
        total_checkins: 6,
        states: [
          { state: "focused", label: "Focused", count: 3, average_intensity: 7 },
          { state: "calm", label: "Calm", count: 2, average_intensity: 6 },
          { state: "energized", label: "Energized", count: 1, average_intensity: 8 },
          { state: "stressed", label: "Stressed", count: 0, average_intensity: 0 },
          { state: "tired", label: "Tired", count: 0, average_intensity: 0 },
        ],
        dominant_state: { state: "focused", label: "Focused", count: 3, average_intensity: 7 },
      },
      weekly_activity: {
        week_start: "2026-04-20",
        week_end: "2026-04-26",
        days: BASE_WEEKLY_DAYS.map(d => ({ ...d, companion: d.companion + 1, journal: d.journal + 1, total: d.total + 2 })),
      },
      cognitive_distortions: null,
      companion_insights: {
        total_sessions: 8,
        total_turns: 42,
        language_distribution: [{ label: "English", count: 6, percentage: 75 }, { label: "Filipino", count: 2, percentage: 25 }],
        emotion_tags: [{ label: "Motivated", count: 8, percentage: 53 }, { label: "Hopeful", count: 6, percentage: 40 }],
        focus_tags: [{ label: "CBT practice", count: 7, percentage: 46 }, { label: "Goal setting", count: 5, percentage: 33 }],
        frequent_tags: [{ label: "Progress", count: 9, percentage: 60 }],
      },
      behavioral_patterns: [
        { type: "positive_reframing", title: "Positive Reframing", share: 60, count: 8, severity: null, window: "7d", keywords: ["better", "improve", "growing"] },
        { type: "goal_oriented", title: "Goal-Oriented Thinking", share: 40, count: 5, severity: null, window: "7d", keywords: ["goal", "plan", "achieve"] },
      ],
      module_contribution: {
        current_rq_score: 54,
        modules: [
          { key: "journal", label: "Journaling", weight: 0.25, actual_points: 18, max_points: 25, summary: "Consistent journaling", deferred: false },
          { key: "companion", label: "AI Companion", weight: 0.3, actual_points: 22, max_points: 30, summary: "High companion engagement", deferred: false },
          { key: "reframing", label: "Reframing", weight: 0.2, actual_points: 14, max_points: 20, summary: "Regular reframing sessions", deferred: false },
          { key: "exercises", label: "Exercises", weight: 0.25, actual_points: 0, max_points: 25, summary: "No exercises logged", deferred: true },
        ],
      },
      exercise_recommendations: {
        items: [
          { title: "Cognitive Restructuring", category: "CBT", match_score: 0.95, description: "Identify and challenge negative thoughts", duration: "15 min", href: "/exercises", reason: "Active CBT program", created_at: "2026-04-23" },
          { title: "Gratitude Journal", category: "Positive Psychology", match_score: 0.88, description: "Daily gratitude practice", duration: "5 min", href: "/exercises", reason: "Positive momentum detected", created_at: "2026-04-23" },
        ],
        categories: ["CBT", "Positive Psychology"],
        score_source: "behavioral_analysis",
      },
    },
    rqHistory: {
      user_id: "client-002",
      range: "7d",
      snapshots: [
        { date: "2026-04-17", score: 48, raw_score: 48, max_raw: 100, breakdown: {} },
        { date: "2026-04-19", score: 50, raw_score: 50, max_raw: 100, breakdown: {} },
        { date: "2026-04-21", score: 52, raw_score: 52, max_raw: 100, breakdown: {} },
        { date: "2026-04-23", score: 54, raw_score: 54, max_raw: 100, breakdown: {} },
      ],
    },
    distortionsSummary: {
      user_id: "client-002",
      range: "7d",
      total_detected: 2,
      dominant_distortion: { label: "Overgeneralization", count: 1, percentage: 50 },
      breakdown: [
        { label: "Overgeneralization", count: 1, percentage: 50 },
        { label: "Should Statements", count: 1, percentage: 50 },
      ],
      patterns: [
        { type: "overgeneralization", title: "Overgeneralization", share: 50, count: 1, severity: "mild", window: "7d", keywords: ["always", "never", "everyone"] },
      ],
    },
  },

  "client-003": {
    report: {
      user_id: "client-003",
      range: "7d",
      overview: { rq_score: 42, adaptive_capacity_percentage: 45, focus_streak_days: 3, total_activity_count: 14 },
      rq_history: null,
      emotional_distribution: {
        range: "7d",
        total_checkins: 4,
        states: [
          { state: "tired", label: "Tired", count: 2, average_intensity: 6.5 },
          { state: "calm", label: "Calm", count: 1, average_intensity: 5 },
          { state: "focused", label: "Focused", count: 1, average_intensity: 7 },
          { state: "stressed", label: "Stressed", count: 0, average_intensity: 0 },
          { state: "energized", label: "Energized", count: 0, average_intensity: 0 },
        ],
        dominant_state: { state: "tired", label: "Tired", count: 2, average_intensity: 6.5 },
      },
      weekly_activity: { week_start: "2026-04-20", week_end: "2026-04-26", days: BASE_WEEKLY_DAYS },
      cognitive_distortions: null,
      companion_insights: {
        total_sessions: 5,
        total_turns: 27,
        language_distribution: [{ label: "Filipino", count: 4, percentage: 80 }, { label: "English", count: 1, percentage: 20 }],
        emotion_tags: [{ label: "Tired", count: 5, percentage: 55 }, { label: "Neutral", count: 3, percentage: 33 }],
        focus_tags: [{ label: "Work-life balance", count: 4, percentage: 44 }, { label: "Reframing", count: 3, percentage: 33 }],
        frequent_tags: [{ label: "Fatigue", count: 5, percentage: 55 }],
      },
      behavioral_patterns: [
        { type: "rumination", title: "Rumination", share: 38, count: 4, severity: "mild", window: "7d", keywords: ["keep thinking", "cant stop", "again"] },
        { type: "self_criticism", title: "Self-Criticism", share: 30, count: 3, severity: "mild", window: "7d", keywords: ["my fault", "bad at", "failed"] },
      ],
      module_contribution: {
        current_rq_score: 42,
        modules: [
          { key: "journal", label: "Journaling", weight: 0.25, actual_points: 12, max_points: 25, summary: "Moderate journal engagement", deferred: false },
          { key: "companion", label: "AI Companion", weight: 0.3, actual_points: 15, max_points: 30, summary: "Regular companion sessions", deferred: false },
          { key: "reframing", label: "Reframing", weight: 0.2, actual_points: 10, max_points: 20, summary: "Active reframing practice", deferred: false },
          { key: "exercises", label: "Exercises", weight: 0.25, actual_points: 5, max_points: 25, summary: "Low exercise completion", deferred: false },
        ],
      },
      exercise_recommendations: {
        items: [
          { title: "Sleep Hygiene", category: "Wellness", match_score: 0.91, description: "Build a consistent sleep routine", duration: "10 min", href: "/exercises", reason: "Fatigue pattern detected", created_at: "2026-04-23" },
          { title: "Mindful Walking", category: "Mindfulness", match_score: 0.82, description: "10-minute mindful walking exercise", duration: "10 min", href: "/exercises", reason: "Low energy patterns", created_at: "2026-04-23" },
        ],
        categories: ["Wellness", "Mindfulness"],
        score_source: "behavioral_analysis",
      },
    },
    rqHistory: {
      user_id: "client-003",
      range: "7d",
      snapshots: [
        { date: "2026-04-17", score: 38, raw_score: 38, max_raw: 100, breakdown: {} },
        { date: "2026-04-19", score: 40, raw_score: 40, max_raw: 100, breakdown: {} },
        { date: "2026-04-21", score: 41, raw_score: 41, max_raw: 100, breakdown: {} },
        { date: "2026-04-23", score: 42, raw_score: 42, max_raw: 100, breakdown: {} },
      ],
    },
    distortionsSummary: {
      user_id: "client-003",
      range: "7d",
      total_detected: 4,
      dominant_distortion: { label: "Personalization", count: 2, percentage: 50 },
      breakdown: [
        { label: "Personalization", count: 2, percentage: 50 },
        { label: "Mental Filter", count: 2, percentage: 50 },
      ],
      patterns: [
        { type: "personalization", title: "Personalization", share: 50, count: 2, severity: "mild", window: "7d", keywords: ["my fault", "blame", "because of me"] },
      ],
    },
  },
};

// Clients 4 and 5 fallback to client-003 data shape with slight changes
CLIENT_INSIGHTS["client-004"] = {
  ...CLIENT_INSIGHTS["client-003"],
  report: {
    ...CLIENT_INSIGHTS["client-003"].report,
    user_id: "client-004",
    overview: { rq_score: 61, adaptive_capacity_percentage: 65, focus_streak_days: 6, total_activity_count: 24 },
  },
  rqHistory: { ...CLIENT_INSIGHTS["client-003"].rqHistory, user_id: "client-004" },
  distortionsSummary: { ...CLIENT_INSIGHTS["client-003"].distortionsSummary, user_id: "client-004" },
};

CLIENT_INSIGHTS["client-005"] = {
  ...CLIENT_INSIGHTS["client-001"],
  report: {
    ...CLIENT_INSIGHTS["client-001"].report,
    user_id: "client-005",
    overview: { rq_score: 35, adaptive_capacity_percentage: 38, focus_streak_days: 1, total_activity_count: 7 },
  },
  rqHistory: { ...CLIENT_INSIGHTS["client-001"].rqHistory, user_id: "client-005" },
  distortionsSummary: { ...CLIENT_INSIGHTS["client-001"].distortionsSummary, user_id: "client-005" },
};

export function getMockClientInsights(clientId: string): MockClientInsights | null {
  return CLIENT_INSIGHTS[clientId] ?? null;
}

export function getMockClient(clientId: string): MHPClient | null {
  return MOCK_CLIENTS.find((c) => c.id === clientId) ?? null;
}
