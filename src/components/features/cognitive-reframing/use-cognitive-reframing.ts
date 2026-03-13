"use client";

import { useEffect, useMemo, useState } from "react";
import { cognitiveReframingService } from "./cognitive-reframing-service";
import { CognitiveReframingDraft, ReframeSuggestion } from "./types";

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
  saveReframe: () => Promise<void>;
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
    if (!canSave) return;

    setIsSaving(true);
    try {
      const saved = await cognitiveReframingService.saveDraft(draft);
      setDraft(saved);
      setSavedSnapshot(createSnapshot(saved));
      setLastSavedAt(saved.savedAt);
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
