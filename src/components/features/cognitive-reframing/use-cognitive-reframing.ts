"use client";

import { useEffect, useMemo, useState } from "react";
import { cognitiveReframingService } from "./cognitive-reframing-service";
import {
  CognitiveReframingDraft,
  CognitiveReframingOverviewSummary,
  ReframeSuggestion,
} from "./types";
import { getMe, SessionUser } from "@/api/auth/auth";
import { createCognitiveReframing } from "@/api/exercise-protocols";
import {
  getCognitiveReframingOverview,
  CognitiveReframingOverviewPayload,
} from "@/api/reframing";
import { DISTORTIONS } from "./constants";

type UseCognitiveReframing = {
  draft: CognitiveReframingDraft;
  suggestion: ReframeSuggestion | null;
  isGenerating: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  canGenerate: boolean;
  canSave: boolean;
  completionRatio: number;
  lastSavedAt: string | null;
  serviceMode: string;
  updateDraft: <K extends keyof CognitiveReframingDraft>(
    key: K,
    value: CognitiveReframingDraft[K],
  ) => void;
  generateReframe: () => Promise<void>;
  saveReframe: () => Promise<CognitiveReframingOverviewSummary | null>;
  resetDraft: () => void;
};

export function useCognitiveReframing(): UseCognitiveReframing {
  const [draft, setDraft] = useState<CognitiveReframingDraft>(() =>
    cognitiveReframingService.createEmptyDraft(),
  );
  const [suggestion, setSuggestion] = useState<ReframeSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    createSnapshot(cognitiveReframingService.createEmptyDraft()),
  );

  const [profile, setProfile] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const res = await getMe();
        if (isMounted) setProfile(res);
      } catch (error) {
        if (isMounted) setProfile(null);
        console.log(error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const latest = cognitiveReframingService.loadLatestDraft();
    if (!latest) return;

    setDraft(latest);
    setSavedSnapshot(createSnapshot(latest));
  }, []);

  const updateDraft: UseCognitiveReframing["updateDraft"] = (key, value) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const completionRatio = useMemo(() => {
    const checks = [
      draft.automaticThought.trim().length > 10,
      draft.evidenceFor.trim().length > 10,
      draft.evidenceAgainst.trim().length > 10,
      draft.balancedThought.trim().length > 10,
      draft.nextAction.trim().length > 10,
    ];

    const completed = checks.filter(Boolean).length;
    return completed / checks.length;
  }, [
    draft.automaticThought,
    draft.evidenceFor,
    draft.evidenceAgainst,
    draft.balancedThought,
    draft.nextAction,
  ]);

  const hasUnsavedChanges = createSnapshot(draft) !== savedSnapshot;
  const canGenerate =
    draft.automaticThought.trim().length > 12 &&
    draft.evidenceAgainst.trim().length > 8 &&
    !isGenerating;
  const canSave =
    draft.balancedThought.trim().length > 10 &&
    draft.nextAction.trim().length > 10 &&
    hasUnsavedChanges &&
    !isSaving;

  const generateReframe = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      const result = await cognitiveReframingService.generateSuggestion(draft);
      setSuggestion(result);
      setDraft((previous) => ({
        ...previous,
        balancedThought: result.balancedThought,
        nextAction: result.nextAction,
        updatedAt: new Date().toISOString(),
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReframe = async () => {
    if (!canSave) return null;

    setIsSaving(true);
    try {
      const saved = await cognitiveReframingService.saveDraft(draft);

      const payload = {
        userId: profile?.id as string,
        automaticThoughts: draft.automaticThought,
        cognitiveDistortion: draft.distortion,
        distressIntensity: draft.intensity,
        evidenceSupportingThought: draft.evidenceFor,
        evidenceAgainstThought: draft.evidenceAgainst,
        balancedThoughtBehavioralExperiment: draft.balancedThought,
      };

      // Prepare AI payload
      const aiOverviewPayload: CognitiveReframingOverviewPayload = {
        automatic_thought: draft.automaticThought,
        cognitive_distortion:
          DISTORTIONS.find((d) => d.key === draft.distortion)?.label ||
          draft.distortion,
        distress_intensity: draft.intensity,
        evidence_supporting_thought: draft.evidenceFor,
        evidence_against_thought: draft.evidenceAgainst,
        balanced_thought: draft.balancedThought,
      };

      // Parallelize the persistence (.NET) and the rich summary (AI Service)
      // This reduces total wait time from (A + B) to max(A, B).
      const [dotNetResult, aiResult] = await Promise.allSettled([
        createCognitiveReframing(payload),
        getCognitiveReframingOverview(aiOverviewPayload),
      ]);

      const dotNetRes =
        dotNetResult.status === "fulfilled" ? dotNetResult.value : null;
      const aiSummary =
        aiResult.status === "fulfilled" ? aiResult.value : null;

      if (!dotNetRes && !aiSummary) {
        console.error("Critical Failure: Both save and AI overview failed.");
        return null;
      }

      setDraft(saved);
      setSavedSnapshot(createSnapshot(saved));
      setLastSavedAt(saved.savedAt);

      return (
        aiSummary ??
        normalizeOverviewSummary(dotNetRes) ??
        buildFallbackOverviewSummary(saved, suggestion)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetDraft = () => {
    const nextDraft = cognitiveReframingService.createEmptyDraft();
    setDraft(nextDraft);
    setSuggestion(null);
    setSavedSnapshot(createSnapshot(nextDraft));
    setLastSavedAt(null);
  };

  return {
    draft,
    suggestion,
    isGenerating,
    isSaving,
    hasUnsavedChanges,
    canGenerate,
    canSave,
    completionRatio,
    lastSavedAt,
    serviceMode: "Local heuristic mode",
    updateDraft,
    generateReframe,
    saveReframe,
    resetDraft,
  };
}

function normalizeOverviewSummary(
  value: unknown,
) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = unwrapOverviewSummaryCandidate(value);
  if (!candidate) {
    return null;
  }

  const distortionPattern = readString(
    candidate,
    "distortion_pattern",
    "distortionPattern",
    "distortion",
    "distortion_pattern_label",
  );
  const patternSummary = readString(
    candidate,
    "pattern_summary",
    "patternSummary",
    "summary",
  );
  const reframedThought = readString(
    candidate,
    "reframed_thought",
    "reframedThought",
    "balanced_thought",
    "balancedThought",
  );
  const confidenceNudge = readString(
    candidate,
    "confidence_nudge",
    "confidenceNudge",
    "nudge",
  );
  const suggestedAction = readString(
    candidate,
    "suggested_action",
    "suggestedAction",
    "next_action",
    "nextAction",
    "behavioral_experiment",
    "behavioralExperiment",
  );

  if (
    !distortionPattern &&
    !patternSummary &&
    !reframedThought &&
    !confidenceNudge &&
    !suggestedAction
  ) {
    return null;
  }

  return {
    distortion_pattern: distortionPattern,
    pattern_summary: patternSummary,
    reframed_thought: reframedThought,
    confidence_nudge: confidenceNudge,
    suggested_action: suggestedAction,
  } satisfies CognitiveReframingOverviewSummary;
}

function unwrapOverviewSummaryCandidate(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (record.data && typeof record.data === "object") {
    const nestedData = record.data as Record<string, unknown>;

    if (nestedData.data && typeof nestedData.data === "object") {
      return nestedData.data as Record<string, unknown>;
    }

    return nestedData;
  }

  return record;
}

function readString(
  source: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function buildFallbackOverviewSummary(
  draft: CognitiveReframingDraft,
  suggestion: ReframeSuggestion | null,
) {
  return {
    distortion_pattern: formatDistortionLabel(draft.distortion),
    pattern_summary:
      suggestion?.rationale ||
      "This thought pattern is creating a rigid conclusion from a stressful interpretation. A more balanced read keeps the concern real without treating it as certain.",
    reframed_thought: draft.balancedThought.trim(),
    confidence_nudge:
      suggestion?.confidence != null
        ? `This reframe reached ${suggestion.confidence}% confidence based on the evidence you entered.`
        : "You already collected evidence against the fear, which is a strong sign of cognitive flexibility.",
    suggested_action: draft.nextAction.trim(),
  } satisfies CognitiveReframingOverviewSummary;
}

function formatDistortionLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createSnapshot(draft: CognitiveReframingDraft) {
  return JSON.stringify({
    automaticThought: draft.automaticThought.trim(),
    distortion: draft.distortion,
    evidenceFor: draft.evidenceFor.trim(),
    evidenceAgainst: draft.evidenceAgainst.trim(),
    intensity: draft.intensity,
    balancedThought: draft.balancedThought.trim(),
    nextAction: draft.nextAction.trim(),
  });
}
