"use client";

import { useMemo, useState } from "react";
import { DISTORTIONS } from "./constants";
import { useCognitiveReframing } from "./use-cognitive-reframing";

export type GuidedStepId =
  | "automaticThought"
  | "distortion"
  | "distress"
  | "evidenceFor"
  | "evidenceAgainst"
  | "reframe";

export type GuidedStep = {
  id: GuidedStepId;
  title: string;
  prompt: string;
  aiPrompt: string;
};

const STEPS: GuidedStep[] = [
  {
    id: "automaticThought",
    title: "Automatic Thought",
    prompt: "What thought is causing distress right now?",
    aiPrompt:
      "Try writing one exact sentence your mind keeps repeating. Keep it specific.",
  },
  {
    id: "distortion",
    title: "Cognitive Distortion",
    prompt: "Which distortion pattern best matches this thought?",
    aiPrompt:
      "Pick the closest distortion first. You can refine wording later after evidence review.",
  },
  {
    id: "distress",
    title: "Distress Intensity",
    prompt: "How emotionally intense does this thought feel right now?",
    aiPrompt:
      "Rate 0 to 10. This helps measure emotional shift after reframing.",
  },
  {
    id: "evidenceFor",
    title: "Evidence Supporting Thought",
    prompt: "What facts seem to support this thought?",
    aiPrompt:
      "Use observable facts, not assumptions. Keep each point short and concrete.",
  },
  {
    id: "evidenceAgainst",
    title: "Evidence Against Thought",
    prompt: "What evidence contradicts or weakens this thought?",
    aiPrompt:
      "Think of previous wins, alternate explanations, and overlooked context.",
  },
  {
    id: "reframe",
    title: "Balanced Thought + Behavioral Experiment",
    prompt: "Generate and refine your balanced thought and next action.",
    aiPrompt:
      "Balanced means realistic, not forced positive. Focus on one testable next step.",
  },
];

export function useGuidedCbtWorkflow() {
  const reframing = useCognitiveReframing();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasDistortionSelection, setHasDistortionSelection] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const isFinalStep = currentStepIndex === STEPS.length - 1;
  const canMoveNext = isStepValid(
    currentStep.id,
    reframing,
    hasDistortionSelection,
  );
  const validationHint = getValidationHint(
    currentStep.id,
    reframing,
    hasDistortionSelection,
  );

  const progressPercent = useMemo(() => {
    return Math.round(((currentStepIndex + 1) / STEPS.length) * 100);
  }, [currentStepIndex]);


  const nextStep = () => {
    if (isFinalStep || !canMoveNext) return;
    setCurrentStepIndex((prev) => prev + 1);
  };

  const previousStep = () => {
    if (currentStepIndex === 0) return;
    setCurrentStepIndex((prev) => prev - 1);
  };

  return {
    ...reframing,
    steps: STEPS,
    currentStep,
    currentStepIndex,
    isFinalStep,
    canMoveNext,
    validationHint,
    progressPercent,
    nextStep,
    previousStep,
    setDistortion: (key: (typeof DISTORTIONS)[number]["key"]) => {
      setHasDistortionSelection(true);
      reframing.updateDraft("distortion", key);
    },
    setDistress: (value: number) => reframing.updateDraft("intensity", value),
  };
}

function isStepValid(
  stepId: GuidedStep["id"],
  state: ReturnType<typeof useCognitiveReframing>,
  hasDistortionSelection: boolean,
) {
  switch (stepId) {
    case "automaticThought":
      return state.draft.automaticThought.trim().length > 10;
    case "distortion":
      return hasDistortionSelection && Boolean(state.draft.distortion);
    case "distress":
      return state.draft.intensity >= 0 && state.draft.intensity <= 10;
    case "evidenceFor":
      return state.draft.evidenceFor.trim().length > 8;
    case "evidenceAgainst":
      return state.draft.evidenceAgainst.trim().length > 8;
    case "reframe":
      return (
        state.draft.balancedThought.trim().length > 10 &&
        state.draft.nextAction.trim().length > 10
      );
    default:
      return false;
  }
}

function getValidationHint(
  stepId: GuidedStep["id"],
  state: ReturnType<typeof useCognitiveReframing>,
  hasDistortionSelection: boolean,
) {
  switch (stepId) {
    case "automaticThought":
      return "Add one clear sentence of your automatic thought.";
    case "distortion":
      return hasDistortionSelection
        ? "Distortion selected."
        : "Select one distortion pattern.";
    case "distress":
      return "Set a distress score from 0 to 10.";
    case "evidenceFor":
      return "List at least one supporting fact.";
    case "evidenceAgainst":
      return "List at least one contradicting fact.";
    case "reframe":
      return "Generate/refine balanced thought and experiment before saving.";
    default:
      return "";
  }
}
