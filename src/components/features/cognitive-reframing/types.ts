export type DistortionKey =
  | "catastrophizing"
  | "overgeneralizing"
  | "mindReading"
  | "emotionalReasoning"
  | "allOrNothing"
  | "labeling"
  | "personalization"
  | "mentalFiltering";

export type DistortionOption = {
  key: DistortionKey;
  label: string;
  hint: string;
};

export type CognitiveReframingDraft = {
  id: string;
  automaticThought: string;
  distortion: DistortionKey;
  evidenceFor: string;
  evidenceAgainst: string;
  intensity: number;
  balancedThought: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
};

export type ReframeSuggestion = {
  balancedThought: string;
  nextAction: string;
  rationale: string;
  confidence: number;
};

export type CognitiveReframingOverviewSummary = {
  distortion_pattern: string;
  pattern_summary: string;
  reframed_thought: string;
  confidence_nudge: string;
  suggested_action: string;
};

export type SavedReframe = CognitiveReframingDraft & {
  savedAt: string;
};
