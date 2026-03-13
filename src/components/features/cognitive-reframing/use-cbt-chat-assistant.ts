"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CognitiveReframingDraft, ReframeSuggestion } from "./types";
import {
  cbtChatService,
  CbtChatMessage,
  createUserMessage,
} from "./cbt-chat-service";
import { GuidedStep } from "./use-guided-cbt-workflow";

type Params = {
  isOpen: boolean;
  currentStep: GuidedStep;
  draft: CognitiveReframingDraft;
  suggestion: ReframeSuggestion | null;
};

export function useCbtChatAssistant({
  isOpen,
  currentStep,
  draft,
  suggestion,
}: Params) {
  const [messages, setMessages] = useState<CbtChatMessage[]>(() => [
    cbtChatService.createWelcomeMessage(),
  ]);
  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const lastGuidedStepRef = useRef<string | null>(null);
  const lastSuggestionHashRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (lastGuidedStepRef.current === currentStep.id) return;

    setMessages((previous) => [
      ...previous,
      cbtChatService.createStepMessage(currentStep),
    ]);
    lastGuidedStepRef.current = currentStep.id;
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen || !suggestion) return;

    const hash = `${suggestion.balancedThought}|${suggestion.nextAction}`;
    if (lastSuggestionHashRef.current === hash) return;

    setMessages((previous) => [
      ...previous,
      cbtChatService.createSuggestionSummaryMessage(
        suggestion.balancedThought,
        suggestion.nextAction,
      ),
    ]);
    lastSuggestionHashRef.current = hash;
  }, [isOpen, suggestion]);

  const quickPrompts = useMemo(
    () => cbtChatService.getQuickPrompts(currentStep.id),
    [currentStep.id],
  );

  const sendMessage = async (providedInput?: string) => {
    const message = (providedInput ?? input).trim();
    if (!message || isReplying) return;

    setMessages((previous) => [...previous, createUserMessage(message)]);
    setInput("");
    setIsReplying(true);

    try {
      const reply = await cbtChatService.generateReply(message, {
        currentStep,
        draft,
      });

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsReplying(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isReplying,
    quickPrompts,
    sendMessage,
  };
}
