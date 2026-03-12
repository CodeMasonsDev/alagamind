import { DistortionOption } from "./types";

export const DISTORTIONS: DistortionOption[] = [
  {
    key: "catastrophizing",
    label: "Catastrophizing",
    hint: "Assuming the worst possible outcome.",
  },
  {
    key: "overgeneralizing",
    label: "Overgeneralizing",
    hint: "One difficult event becomes a permanent pattern.",
  },
  {
    key: "mindReading",
    label: "Mind Reading",
    hint: "Believing you know what others are thinking.",
  },
  {
    key: "emotionalReasoning",
    label: "Emotional Reasoning",
    hint: "Assuming feelings are facts.",
  },
  {
    key: "allOrNothing",
    label: "All-or-Nothing",
    hint: "Seeing situations in black-or-white extremes.",
  },
  {
    key: "labeling",
    label: "Labeling",
    hint: "Reducing yourself to a harsh global label.",
  },
  {
    key: "personalization",
    label: "Personalization",
    hint: "Taking full blame for complex outcomes.",
  },
  {
    key: "mentalFiltering",
    label: "Mental Filtering",
    hint: "Focusing only on negatives and ignoring positives.",
  },
];

export const DEFAULT_DISTORTION = DISTORTIONS[0].key;
