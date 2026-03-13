import { DEFAULT_DISTORTION } from "./constants";
import {
  CognitiveReframingDraft,
  DistortionKey,
  ReframeSuggestion,
  SavedReframe,
} from "./types";

const STORAGE_KEY = "alagamind.cognitive-reframes.v1";

export type CognitiveReframingService = {
  createEmptyDraft: () => CognitiveReframingDraft;
  loadLatestDraft: () => CognitiveReframingDraft | null;
  generateSuggestion: (
    draft: CognitiveReframingDraft,
  ) => Promise<ReframeSuggestion>;
  saveDraft: (draft: CognitiveReframingDraft) => Promise<SavedReframe>;
};

const distortionOpeners: Record<DistortionKey, string> = {
  catastrophizing: "My brain is escalating threat right now.",
  overgeneralizing: "This single moment may not represent the full pattern.",
  mindReading: "I am assuming intent without direct evidence.",
  emotionalReasoning: "Feeling strongly does not always mean the thought is true.",
  allOrNothing: "This situation is more nuanced than all-or-nothing.",
  labeling: "A label is not an identity.",
  personalization: "Multiple factors shape outcomes, not only me.",
  mentalFiltering: "I may be noticing only the negative data right now.",
};

export const cognitiveReframingService: CognitiveReframingService = {
  createEmptyDraft() {
    const now = new Date().toISOString();

    return {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      automaticThought: "",
      distortion: DEFAULT_DISTORTION,
      evidenceFor: "",
      evidenceAgainst: "",
      intensity: 7,
      balancedThought: "",
      nextAction: "",
      createdAt: now,
      updatedAt: now,
    };
  },

  loadLatestDraft() {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as SavedReframe[];
      if (!Array.isArray(parsed) || parsed.length === 0) return null;

      const latest = parsed[0];

      return {
        id: String(latest.id ?? ""),
        automaticThought: String(latest.automaticThought ?? ""),
        distortion: (latest.distortion ?? DEFAULT_DISTORTION) as DistortionKey,
        evidenceFor: String(latest.evidenceFor ?? ""),
        evidenceAgainst: String(latest.evidenceAgainst ?? ""),
        intensity:
          typeof latest.intensity === "number" ? latest.intensity : 7,
        balancedThought: String(latest.balancedThought ?? ""),
        nextAction: String(latest.nextAction ?? ""),
        createdAt: String(latest.createdAt ?? new Date().toISOString()),
        updatedAt: String(latest.updatedAt ?? new Date().toISOString()),
      };
    } catch {
      return null;
    }
  },

  async generateSuggestion(draft) {
    const thought = normalizeSentence(draft.automaticThought);
    const evidenceFor = normalizeSentence(draft.evidenceFor);
    const evidenceAgainst = normalizeSentence(draft.evidenceAgainst);

    const base =
      distortionOpeners[draft.distortion] ??
      "This thought may not represent the full picture.";

    const balancedThought = [
      base,
      thought ? `I notice the thought: "${thought}".` : "",
      evidenceAgainst
        ? `Counter-evidence exists: ${evidenceAgainst}.`
        : "I can gather additional evidence before deciding.",
      "A balanced response is to stay specific, test assumptions, and choose one controllable step.",
    ]
      .filter(Boolean)
      .join(" ");

    const actionAnchor = evidenceFor
      ? `Use what is true right now (${evidenceFor}) as an anchor.`
      : "Anchor to one verified fact before reacting.";

    const nextAction = [
      "Next 10-minute experiment:",
      "write one realistic outcome, one support resource, and one tiny action you can take today.",
      actionAnchor,
    ].join(" ");

    const confidence = getConfidenceScore(draft);

    // Keep async shape so it can be replaced by an API call later.
    await wait(250);

    return {
      balancedThought,
      nextAction,
      rationale:
        "Suggestion generated with local cognitive-distortion heuristics and evidence balancing.",
      confidence,
    };
  },

  async saveDraft(draft) {
    const savedAt = new Date().toISOString();
    const payload: SavedReframe = {
      ...draft,
      updatedAt: savedAt,
      savedAt,
    };

    if (typeof window !== "undefined") {
      const existing = safeReadStorage();
      const next = [payload, ...existing.filter((entry) => entry.id !== draft.id)]
        .slice(0, 30);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    await wait(150);
    return payload;
  },
};

function safeReadStorage(): SavedReframe[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedReframe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeSentence(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getConfidenceScore(draft: CognitiveReframingDraft) {
  let points = 0;
  if (draft.automaticThought.trim().length > 12) points += 25;
  if (draft.evidenceFor.trim().length > 12) points += 20;
  if (draft.evidenceAgainst.trim().length > 12) points += 30;
  if (draft.distortion) points += 15;
  if (draft.intensity >= 0) points += 10;
  return Math.min(100, points);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
