import { CognitiveReframingDraft } from "./types";
import { GuidedStep } from "./use-guided-cbt-workflow";

export type CbtChatRole = "assistant" | "user";

export type CbtChatMessage = {
  id: string;
  role: CbtChatRole;
  content: string;
  createdAt: string;
};

type ReplyContext = {
  currentStep: GuidedStep;
  draft: CognitiveReframingDraft;
};

export const cbtChatService = {
  createWelcomeMessage(): CbtChatMessage {
    return createAssistantMessage(
      "CBT copilot ready. I will guide reflection step-by-step and only generate reframing at the final step.",
    );
  },

  createStepMessage(step: GuidedStep): CbtChatMessage {
    return createAssistantMessage(
      `Step focus: ${step.title}. ${step.aiPrompt}`,
    );
  },

  getQuickPrompts(stepId: GuidedStep["id"]) {
    if (stepId === "automaticThought") {
      return ["I find this difficult", "Give me an example", "Skip for now"];
    }

    if (stepId === "distortion") {
      return ["Explain this distortion", "Give me an example", "Skip for now"];
    }

    if (stepId === "distress") {
      return ["How should I rate intensity?", "I find this difficult", "Skip for now"];
    }

    if (stepId === "evidenceFor") {
      return [
        "What counts as supporting evidence?",
        "Give me an example",
        "Skip for now",
      ];
    }

    if (stepId === "evidenceAgainst") {
      return [
        "Help me find counter-evidence",
        "Ask me reflective questions",
        "Skip for now",
      ];
    }

    return [
      "Generate balanced thought",
      "Suggest a behavioral experiment",
      "Skip for now",
    ];
  },

  async generateReply(input: string, context: ReplyContext) {
    const message = input.toLowerCase();
    const stepId = context.currentStep.id;

    await wait(280);

    if (message.includes("catastroph")) {
      return "Catastrophizing means predicting the worst-case scenario as if it is certain. Ask: what is most likely, not just most feared?";
    }

    if (message.includes("mind reading")) {
      return "Mind reading assumes you know others' thoughts. Ask: what direct evidence do I have, and what neutral alternatives exist?";
    }

    if (message.includes("example")) {
      return getExampleForStep(stepId);
    }

    if (message.includes("skip")) {
      return "Skipping is okay. We can move to the next step and return later when you feel ready.";
    }

    if (message.includes("difficult")) {
      return "That is valid. Take one breath, then answer with just one concrete sentence. Small progress is enough.";
    }

    if (stepId === "automaticThought") {
      return "Try this template: 'If X happens, then Y bad outcome means Z about me.' Keep it in one sentence.";
    }

    if (stepId === "distortion") {
      return "Pick the distortion that captures the main pattern first. Precision is good, but progress matters more at this step.";
    }

    if (stepId === "distress") {
      return "Rate your felt intensity now, not what you think it should be. We compare this with post-reframe intensity later.";
    }

    if (stepId === "evidenceFor") {
      return "Use concrete facts only. Avoid guesses and interpretations in this section.";
    }

    if (stepId === "evidenceAgainst") {
      return "Start with one counter-example from your past where the feared outcome did not fully happen.";
    }

    const hasFinalInputs =
      context.draft.evidenceAgainst.trim().length > 8 &&
      context.draft.automaticThought.trim().length > 10;

    if (!hasFinalInputs) {
      return "Before generation, tighten your automatic thought and evidence-against entries so the balanced thought stays realistic.";
    }

    return "At this stage, generate a balanced thought that is realistic, then define one small behavioral test you can complete today.";
  },

  createSuggestionSummaryMessage(
    balancedThought: string,
    nextAction: string,
  ): CbtChatMessage {
    return createAssistantMessage(
      `Draft generated. Balanced thought: ${balancedThought} Next experiment: ${nextAction}`,
    );
  },
};

function getExampleForStep(stepId: GuidedStep["id"]) {
  if (stepId === "automaticThought") {
    return `Example: "If I pause during my thesis defense, everyone will think I am not prepared."`;
  }

  if (stepId === "evidenceFor") {
    return "Example supporting evidence: I stumbled in the last presentation and felt unprepared.";
  }

  if (stepId === "evidenceAgainst") {
    return "Example against evidence: I have answered panel questions before and recovered after pauses.";
  }

  if (stepId === "reframe") {
    return "Example balanced thought: I feel anxious, but anxiety is not proof of failure. I can prepare one clear opening and practice twice.";
  }

  return "Example: choose the option that most closely matches your thinking pattern, then continue.";
}

function createAssistantMessage(content: string): CbtChatMessage {
  return {
    id: createMessageId(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createUserMessage(content: string): CbtChatMessage {
  return {
    id: createMessageId(),
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
