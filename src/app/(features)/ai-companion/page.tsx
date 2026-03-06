"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Composer from "@/components/ai-companion/composer";
import TopBar from "@/components/ai-companion/top-bar";
import ConversationArea from "@/components/ai-companion/conversation-area";

export type Suggestion = {
  title: string;
  description: string;
  duration: string;
  supportText: string;
  actionText: string;
  command: string;
};

export type ChatMessage =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; kind: "intro" }
  | { id: number; role: "assistant"; kind: "insight" }
  | { id: number; role: "assistant"; kind: "text"; text: string };

type ChatMessageWithoutId =
  | { role: "user"; text: string }
  | { role: "assistant"; kind: "intro" }
  | { role: "assistant"; kind: "insight" }
  | { role: "assistant"; kind: "text"; text: string };

const QUICK_COMMANDS = [
  "/ start-breathing",
  "/ journal-entry",
  "/ grounding-tools",
];

export const SUGGESTIONS: Suggestion[] = [
  {
    title: "GENTLE BREATHING RESET",
    description:
      "Try a short paced breathing cycle to settle the body and ease racing thoughts.",
    duration: "5m",
    supportText: "Calms racing thoughts",
    actionText: "Start Exercise",
    command: "/ start-breathing",
  },
  {
    title: "GUIDED REFLECTION",
    description:
      "Use a quick journaling prompt to release unfinished thoughts and reduce mental load.",
    duration: "8m",
    supportText: "Clears mental clutter",
    actionText: "Start Journal",
    command: "/ journal-entry",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: "user",
    text: "I've been feeling really stressed lately. My mind won't slow down",
  },
  {
    id: 2,
    role: "user",
    text: "Mostly my thoughts. I keep thinking about things I haven't finished ",
  },
  { id: 3, role: "assistant", kind: "intro" },
  { id: 4, role: "assistant", kind: "insight" },
];

const COMMAND_RESPONSES: Record<string, string> = {
  "/ start-breathing":
    "Great choice. Starting a gentle breathing reset: inhale for 4, hold for 2, exhale for 6. Repeat for 5 minutes at a calm pace.",
  "/ journal-entry":
    "Opening a guided reflection flow. Prompt: What is one unfinished thought you can safely park for later, and what is one next step you can do today?",
  "/ grounding-tools":
    "Here are grounding options: 5-4-3-2-1 sensory check, cold water on wrists, or a 60-second body scan. Pick one and I will guide you through it.",
};

const DEFAULT_ASSISTANT_RESPONSES = [
  "Thank you for sharing that. Let's slow this down together and focus on one manageable piece at a time.",
  "That makes sense. When thoughts pile up, we can reduce pressure by naming what is urgent versus what can wait.",
  "I hear you. If you're open to it, we can try a 2-minute reset before planning the next small step.",
];

export default function AiCompanionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const nextIdRef = useRef(INITIAL_MESSAGES.length + 1);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fallbackIndex = useMemo(
    () => messages.filter((msg) => msg.role === "assistant").length,
    [messages],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [messages, isTyping]);

  function pushMessage(message: ChatMessageWithoutId) {
    setMessages((prev) => [
      ...prev,
      { ...message, id: nextIdRef.current++ } as ChatMessage,
    ]);
  }

  function buildAssistantResponse(userText: string): string {
    const normalized = userText.toLowerCase().trim();

    if (normalized in COMMAND_RESPONSES) {
      return COMMAND_RESPONSES[normalized];
    }

    if (normalized.includes("stress") || normalized.includes("overwhelm")) {
      return "I hear how heavy this feels right now. Would you like to do a 60-second breathing pause first, then list the top 1-2 stressors together?";
    }

    if (normalized.includes("thought") || normalized.includes("mind")) {
      return "You're noticing looping thoughts clearly, which is a strong first step. We can park those thoughts in a quick list so your mind does not have to hold everything at once.";
    }

    return DEFAULT_ASSISTANT_RESPONSES[
      fallbackIndex % DEFAULT_ASSISTANT_RESPONSES.length
    ];
  }

  function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || isTyping) {
      return;
    }

    pushMessage({ role: "user", text });
    setInput("");
    setIsTyping(true);

    const response = buildAssistantResponse(text);
    window.setTimeout(() => {
      pushMessage({ role: "assistant", kind: "text", text: response });
      setIsTyping(false);
    }, 700);
  }

  function handleSuggestionStart(command: string) {
    sendMessage(command);
  }

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50/60">
      <TopBar />

      <main
        ref={scrollContainerRef}
        className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        <ConversationArea
          messages={messages}
          isTyping={isTyping}
          onSuggestionStart={handleSuggestionStart}
        />
      </main>

      <Composer
        input={input}
        onInputChange={setInput}
        onSend={sendMessage}
        onCommandSelect={sendMessage}
        isTyping={isTyping}
      />
    </div>
  );
}
