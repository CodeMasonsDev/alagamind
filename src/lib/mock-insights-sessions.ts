export type EmotionTrendPoint = {
  label: string;
  value: number;
  dominantEmotion: string;
  dateLabel: string;
};

export type HourlyHeatmapCell = {
  hour: string;
  intensity: number;
  emotion: string;
};

export type RQHistoryPoint = {
  label: string;
  value: number;
  note: string;
};

export type RQComponentBreakdown = {
  label: string;
  weight: number;
  current: number;
  note: string;
};

export type DistortionReportItem = {
  label: string;
  count: number;
  share: number;
  trend: "improving" | "recurring";
  change: string;
  note: string;
};

export type SentimentRatioPoint = {
  label: string;
  positive: number;
  negative: number;
  note: string;
};

export type ActivityWeek = {
  label: string;
  checkIns: number;
  journals: number;
  reframes: number;
  exercises: number;
};

export type StreakSummary = {
  label: string;
  current: number;
  best: number;
  note: string;
};

export type WeeklyReportSignal = {
  label: string;
  value: string;
  tone: "teal" | "amber" | "rose" | "violet";
};

export type WeeklyReportCardData = {
  weekRange: string;
  rqScore: number;
  delta: number;
  topEmotion: string;
  topDistortion: string;
  streak: number;
  therapistSummary: string[];
  recommendations: string[];
  careSignals: WeeklyReportSignal[];
};

export type SessionLogItem = {
  id: string;
  title: string;
  date: string;
  turnCount: number;
  dominantEmotion: string;
  language: string;
  theme: string;
  summary: string;
};

export type SessionThemeItem = {
  label: string;
  sessions: number;
  direction: "rising" | "steady" | "cooling";
  note: string;
};

export type ReframeHistoryItem = {
  savedAt: string;
  distortion: string;
  tone: "Logical" | "Compassionate" | "Direct";
  originalThought: string;
  reframe: string;
};

export type ExerciseCompletionItem = {
  protocol: string;
  completedAt: string;
  duration: string;
  frequency: string;
  outcome: string;
};

export const insightsReportsMockData = {
  summary: {
    currentRqScore: 74,
    rqDelta: 6,
    topEmotion: "Calm",
    streakDays: 19,
    sentimentRatio: "61 / 39",
  },
  emotionalTrends: {
    dailyDominantEmotion: "Focused",
    weeklyDominantEmotion: "Calm",
    moodCurve: [
      {
        label: "Mon",
        value: 42,
        dominantEmotion: "Overwhelmed",
        dateLabel: "Mar 25",
      },
      {
        label: "Tue",
        value: 48,
        dominantEmotion: "Anxious",
        dateLabel: "Mar 26",
      },
      {
        label: "Wed",
        value: 55,
        dominantEmotion: "Focused",
        dateLabel: "Mar 27",
      },
      {
        label: "Thu",
        value: 63,
        dominantEmotion: "Calm",
        dateLabel: "Mar 28",
      },
      {
        label: "Fri",
        value: 58,
        dominantEmotion: "Tired",
        dateLabel: "Mar 29",
      },
      {
        label: "Sat",
        value: 69,
        dominantEmotion: "Calm",
        dateLabel: "Mar 30",
      },
      {
        label: "Sun",
        value: 72,
        dominantEmotion: "Focused",
        dateLabel: "Mar 31",
      },
    ] satisfies EmotionTrendPoint[],
    hourlyHeatmap: [
      { hour: "00", intensity: 1, emotion: "Calm" },
      { hour: "01", intensity: 1, emotion: "Calm" },
      { hour: "02", intensity: 1, emotion: "Sleepy" },
      { hour: "03", intensity: 1, emotion: "Sleepy" },
      { hour: "04", intensity: 2, emotion: "Restless" },
      { hour: "05", intensity: 2, emotion: "Restless" },
      { hour: "06", intensity: 3, emotion: "Anxious" },
      { hour: "07", intensity: 4, emotion: "Focused" },
      { hour: "08", intensity: 4, emotion: "Focused" },
      { hour: "09", intensity: 3, emotion: "Alert" },
      { hour: "10", intensity: 2, emotion: "Settled" },
      { hour: "11", intensity: 2, emotion: "Settled" },
      { hour: "12", intensity: 3, emotion: "Pressured" },
      { hour: "13", intensity: 4, emotion: "Driven" },
      { hour: "14", intensity: 5, emotion: "Focused" },
      { hour: "15", intensity: 4, emotion: "Focused" },
      { hour: "16", intensity: 3, emotion: "Calm" },
      { hour: "17", intensity: 3, emotion: "Calm" },
      { hour: "18", intensity: 2, emotion: "Tired" },
      { hour: "19", intensity: 3, emotion: "Reflective" },
      { hour: "20", intensity: 4, emotion: "Overthinking" },
      { hour: "21", intensity: 4, emotion: "Anxious" },
      { hour: "22", intensity: 3, emotion: "Calm" },
      { hour: "23", intensity: 2, emotion: "Sleepy" },
    ] satisfies HourlyHeatmapCell[],
  },
  rqHistory: {
    curve: [
      { label: "Week 1", value: 58, note: "Baseline after onboarding" },
      { label: "Week 2", value: 61, note: "Check-ins became consistent" },
      { label: "Week 3", value: 64, note: "Two saved reframes" },
      { label: "Week 4", value: 68, note: "Journaling cadence improved" },
      { label: "Week 5", value: 72, note: "Exercises added back in" },
      { label: "Week 6", value: 74, note: "Current week snapshot" },
    ] satisfies RQHistoryPoint[],
    components: [
      {
        label: "Journals",
        weight: 35,
        current: 28,
        note: "5 journal entries contributed this cycle.",
      },
      {
        label: "Reframes",
        weight: 30,
        current: 21,
        note: "7 saved reframes with follow-through.",
      },
      {
        label: "Exercises",
        weight: 25,
        current: 17,
        note: "3 guided protocols completed this week.",
      },
      {
        label: "Check-ins",
        weight: 10,
        current: 8,
        note: "14 check-ins kept the baseline fresh.",
      },
    ] satisfies RQComponentBreakdown[],
  },
  distortionReport: [
    {
      label: "All-or-nothing thinking",
      count: 12,
      share: 31,
      trend: "improving",
      change: "18% lower than last month",
      note: "Usually appears around exam prep and comparison with peers.",
    },
    {
      label: "Catastrophizing",
      count: 9,
      share: 24,
      trend: "recurring",
      change: "Flat month over month",
      note: "Still shows up in late-night companion sessions.",
    },
    {
      label: "Mind reading",
      count: 7,
      share: 18,
      trend: "improving",
      change: "Down after two relationship reframes",
      note: "Reframes are shortening the recovery time here.",
    },
    {
      label: "Emotional reasoning",
      count: 6,
      share: 15,
      trend: "recurring",
      change: "2 new repeats this week",
      note: "Most common after low-sleep days and missed check-ins.",
    },
  ] satisfies DistortionReportItem[],
  journalSentiment: [
    {
      label: "Week 1",
      positive: 46,
      negative: 54,
      note: "High deadline pressure.",
    },
    {
      label: "Week 2",
      positive: 52,
      negative: 48,
      note: "More neutral endings after journaling.",
    },
    {
      label: "Week 3",
      positive: 57,
      negative: 43,
      note: "Compassionate reframes carried over.",
    },
    {
      label: "Week 4",
      positive: 61,
      negative: 39,
      note: "Best week for positive closing statements.",
    },
  ] satisfies SentimentRatioPoint[],
  activitySummary: {
    weeklyCounts: [
      {
        label: "Week 1",
        checkIns: 9,
        journals: 3,
        reframes: 5,
        exercises: 2,
      },
      {
        label: "Week 2",
        checkIns: 12,
        journals: 4,
        reframes: 6,
        exercises: 3,
      },
      {
        label: "Week 3",
        checkIns: 13,
        journals: 4,
        reframes: 8,
        exercises: 2,
      },
      {
        label: "Week 4",
        checkIns: 14,
        journals: 5,
        reframes: 7,
        exercises: 4,
      },
    ] satisfies ActivityWeek[],
    streaks: [
      {
        label: "Check-in streak",
        current: 19,
        best: 26,
        note: "Active and still climbing.",
      },
      {
        label: "Journal streak",
        current: 4,
        best: 8,
        note: "Recovered after a missed weekend.",
      },
      {
        label: "Exercise streak",
        current: 3,
        best: 5,
        note: "Most reliable when scheduled before bed.",
      },
    ] satisfies StreakSummary[],
  },
  weeklyReportCard: {
    weekRange: "March 25 to March 31",
    rqScore: 74,
    delta: 6,
    topEmotion: "Calm",
    topDistortion: "All-or-nothing thinking",
    streak: 19,
    therapistSummary: [
      "Mood intensity softened after midweek, with calmer check-ins following two saved reframes and one box-breathing session.",
      "Academic pressure still triggers the highest-intensity entries, but catastrophic wording is less frequent than in the prior month.",
      "Journal sentiment is trending positive overall, though negative language still clusters during late-evening reflection windows.",
    ],
    recommendations: [
      "Protect the evening routine between 8 PM and 10 PM, where the heatmap still shows the strongest intensity spikes.",
      "Use the direct reframe tone during exam preparation, since that style was saved most often in successful sessions.",
      "Keep at least three exercise completions per week to prevent the RQ exercises component from flattening.",
    ],
    careSignals: [
      {
        label: "Protective factor",
        value: "Consistent journaling 5 times this week",
        tone: "teal",
      },
      {
        label: "Watch area",
        value: "Catastrophizing still repeats in late-night sessions",
        tone: "amber",
      },
      {
        label: "Strongest lever",
        value: "Morning check-ins stabilize the rest of the day",
        tone: "violet",
      },
    ],
  } satisfies WeeklyReportCardData,
};

export const historySessionsMockData = {
  summary: {
    sessionsThisMonth: 18,
    averageTurns: 11,
    savedReframes: 27,
    protocolsCompleted: 9,
    languagesTracked: 2,
  },
  sessionLog: [
    {
      id: "S-204",
      title: "Late-night overthinking",
      date: "Apr 1, 2026 · 9:03 PM",
      turnCount: 14,
      dominantEmotion: "Anxious",
      language: "English",
      theme: "Exam stress",
      summary: "Conversation moved from quiz pressure into sleep worries.",
    },
    {
      id: "S-203",
      title: "Post-argument recovery",
      date: "Mar 31, 2026 · 7:18 PM",
      turnCount: 10,
      dominantEmotion: "Hurt",
      language: "Taglish",
      theme: "Relationship tension",
      summary: "Ended with a compassionate reframe and grounding prompt.",
    },
    {
      id: "S-202",
      title: "Burnout check-in",
      date: "Mar 30, 2026 · 6:42 AM",
      turnCount: 8,
      dominantEmotion: "Tired",
      language: "English",
      theme: "Burnout",
      summary: "Morning session focused on low energy and task avoidance.",
    },
    {
      id: "S-201",
      title: "Confidence reset",
      date: "Mar 29, 2026 · 4:10 PM",
      turnCount: 12,
      dominantEmotion: "Focused",
      language: "English",
      theme: "Self-worth",
      summary: "Resolved into a logical reframe before study time.",
    },
    {
      id: "S-200",
      title: "Family expectation spiral",
      date: "Mar 28, 2026 · 8:27 PM",
      turnCount: 16,
      dominantEmotion: "Pressured",
      language: "Taglish",
      theme: "Family pressure",
      summary: "High-turn session with repeated mind-reading patterns.",
    },
    {
      id: "S-199",
      title: "Pre-presentation nerves",
      date: "Mar 27, 2026 · 1:05 PM",
      turnCount: 9,
      dominantEmotion: "Nervous",
      language: "English",
      theme: "Performance anxiety",
      summary: "Ended with breathing guidance and direct self-talk.",
    },
  ] satisfies SessionLogItem[],
  themes: [
    {
      label: "Exam stress",
      sessions: 9,
      direction: "rising",
      note: "Most common opener in the last two weeks.",
    },
    {
      label: "Relationship tension",
      sessions: 6,
      direction: "steady",
      note: "Appears regularly but resolves faster now.",
    },
    {
      label: "Burnout",
      sessions: 5,
      direction: "rising",
      note: "Often paired with skipped meals or low sleep.",
    },
    {
      label: "Family pressure",
      sessions: 4,
      direction: "cooling",
      note: "Less frequent after boundary-focused reframes.",
    },
    {
      label: "Performance anxiety",
      sessions: 3,
      direction: "steady",
      note: "Shows up before presentations and quizzes.",
    },
  ] satisfies SessionThemeItem[],
  reframeHistory: [
    {
      savedAt: "Apr 1, 2026 · 9:14 PM",
      distortion: "Catastrophizing",
      tone: "Logical",
      originalThought:
        "If I do badly on this quiz, I will ruin the whole semester.",
      reframe:
        "One quiz affects one grade component, not the entire semester outcome.",
    },
    {
      savedAt: "Mar 31, 2026 · 7:29 PM",
      distortion: "Mind reading",
      tone: "Compassionate",
      originalThought:
        "They sounded cold, so they must be tired of me already.",
      reframe:
        "A short reply can mean many things; pause before assigning the worst motive.",
    },
    {
      savedAt: "Mar 30, 2026 · 6:57 AM",
      distortion: "Emotional reasoning",
      tone: "Direct",
      originalThought: "I feel drained, so I must be failing at everything.",
      reframe:
        "Fatigue is a body signal, not proof that your effort means nothing.",
    },
    {
      savedAt: "Mar 29, 2026 · 4:21 PM",
      distortion: "All-or-nothing thinking",
      tone: "Logical",
      originalThought:
        "If I am not fully confident today, I should not even present.",
      reframe:
        "Prepared and imperfect still beats silent and untested.",
    },
    {
      savedAt: "Mar 28, 2026 · 8:41 PM",
      distortion: "Personalization",
      tone: "Compassionate",
      originalThought:
        "Everyone at home is stressed because I am disappointing them.",
      reframe:
        "Other people’s tension has multiple causes and is not automatic evidence about your worth.",
    },
  ] satisfies ReframeHistoryItem[],
  exerciseLog: [
    {
      protocol: "Box Breathing",
      completedAt: "Apr 1, 2026 · 9:28 PM",
      duration: "4 min",
      frequency: "3 times this week",
      outcome: "Intensity dropped from 7 to 4 before sleep.",
    },
    {
      protocol: "Grounding 5-4-3-2-1",
      completedAt: "Mar 31, 2026 · 7:34 PM",
      duration: "6 min",
      frequency: "2 times this week",
      outcome: "Helped shift from relationship rumination into recovery.",
    },
    {
      protocol: "Guided CBT Workflow",
      completedAt: "Mar 30, 2026 · 6:49 AM",
      duration: "12 min",
      frequency: "1 time this week",
      outcome: "Generated one saved direct reframe tied to burnout.",
    },
    {
      protocol: "Behavioral Activation",
      completedAt: "Mar 29, 2026 · 3:56 PM",
      duration: "10 min",
      frequency: "2 times this month",
      outcome: "Restored study momentum before a lab task.",
    },
    {
      protocol: "Cognitive Reframing",
      completedAt: "Mar 28, 2026 · 8:19 PM",
      duration: "9 min",
      frequency: "4 times this week",
      outcome: "Produced two saved reframes around family pressure.",
    },
  ] satisfies ExerciseCompletionItem[],
};
