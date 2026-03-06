"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Circle,
  Ellipsis,
  Heart,
  Loader2,
  Lock,
  Mic,
  SendHorizontal,
  Sparkles,
  User,
  WandSparkles,
} from "lucide-react";

type Suggestion = {
  title: string;
  description: string;
  duration: string;
  supportText: string;
  actionText: string;
  command: string;
};

type ChatMessage =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; kind: "intro" }
  | { id: number; role: "assistant"; kind: "insight" }
  | { id: number; role: "assistant"; kind: "text"; text: string };

const QUICK_COMMANDS = [
  "/ start-breathing",
  "/ journal-entry",
  "/ grounding-tools",
];

const SUGGESTIONS: Suggestion[] = [
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
    text: "I've been feeling really stressed lately. My mind won't slow down, and I",
  },
  {
    id: 2,
    role: "user",
    text: "Mostly my thoughts. I keep thinking about things I haven't finished and",
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
  const endRef = useRef<HTMLDivElement | null>(null);

  const fallbackIndex = useMemo(
    () => messages.filter((msg) => msg.role === "assistant").length,
    [messages],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  function pushMessage(message: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...message, id: nextIdRef.current++ }]);
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
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <TopBar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <ConversationArea
          messages={messages}
          isTyping={isTyping}
          onSuggestionStart={handleSuggestionStart}
          endRef={endRef}
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

function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        <span className="text-slate-900">Conversation Flow</span>
        <span className="text-slate-300">/</span>
        <span className="flex items-center gap-1.5 text-orange-600">
          <Circle className="h-2.5 w-2.5 fill-current" />
          Status: Supportive Interaction
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          <Lock size={12} />
          Secure Connection
        </span>
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Ellipsis size={18} />
        </button>
      </div>
    </header>
  );
}

function ConversationArea({
  messages,
  isTyping,
  onSuggestionStart,
  endRef,
}: {
  messages: ChatMessage[];
  isTyping: boolean;
  onSuggestionStart: (command: string) => void;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="flex flex-1 flex-col gap-8 pb-28">
      {messages.map((message) => {
        if (message.role === "user") {
          return <UserMessage key={message.id} text={message.text} />;
        }

        if (message.kind === "intro") {
          return <IntroAssistantCard key={message.id} />;
        }

        if (message.kind === "insight") {
          return (
            <InsightAssistantCard
              key={message.id}
              onSuggestionStart={onSuggestionStart}
            />
          );
        }

        return <AssistantTextCard key={message.id} text={message.text} />;
      })}

      {isTyping ? <TypingIndicator /> : null}
      <div ref={endRef} />
    </section>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="ml-auto flex max-w-2xl items-end gap-2">
      <p className="rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
        {text}
      </p>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
        <User size={14} />
      </span>
    </div>
  );
}

function AssistantCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="relative max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 pl-14 shadow-sm">
      <span className="absolute left-4 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-teal-600">
        <Bot size={16} />
      </span>
      <div className="flex flex-col gap-5">{children}</div>
    </article>
  );
}

function IntroAssistantCard() {
  return (
    <AssistantCard>
      <p className="text-[15px] leading-relaxed text-slate-600">
        Thank you for sharing that so honestly. Carrying this much stress for a
        while can feel exhausting, especially when your mind keeps running even
        when your body wants rest.
      </p>
      <p className="text-[15px] font-bold leading-relaxed text-slate-900">
        What feels most stressful right now-your workload, your thoughts, or how
        your body feels?
      </p>
    </AssistantCard>
  );
}

function InsightAssistantCard({
  onSuggestionStart,
}: {
  onSuggestionStart: (command: string) => void;
}) {
  return (
    <AssistantCard>
      <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
          <Sparkles size={14} />
          Cognitive Insight
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          When unfinished tasks stay active in your mind, your thoughts can loop
          to keep searching for closure. That loop can make it harder for your
          nervous system to register safety and rest.
        </p>
      </div>

      <div className="mt-1">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Here are a couple of gentle options you can try:
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => (
            <SuggestionCard
              key={suggestion.title}
              suggestion={suggestion}
              onStart={onSuggestionStart}
            />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-teal-100 bg-teal-50/60 p-4">
        <Heart className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
        <p className="text-sm leading-relaxed text-slate-600">
          You&apos;re not alone in this, and there&apos;s nothing wrong with you for
          feeling stressed. We can take this one small step at a time. I&apos;m here
          with you.
        </p>
      </div>
    </AssistantCard>
  );
}

function AssistantTextCard({ text }: { text: string }) {
  return (
    <AssistantCard>
      <p className="text-[15px] leading-relaxed text-slate-600">{text}</p>
    </AssistantCard>
  );
}

function SuggestionCard({
  suggestion,
  onStart,
}: {
  suggestion: Suggestion;
  onStart: (command: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-900">
        {suggestion.title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {suggestion.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="text-xs font-semibold text-slate-500">
          <span className="text-slate-900">{suggestion.duration}</span> (
          {suggestion.supportText})
        </p>
        <button
          type="button"
          onClick={() => onStart(suggestion.command)}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 transition-colors hover:text-teal-700"
        >
          {suggestion.actionText}
          <WandSparkles size={14} />
        </button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <AssistantCard>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={14} className="animate-spin text-teal-600" />
        AlagaMind AI is typing...
      </div>
    </AssistantCard>
  );
}

function Composer({
  input,
  onInputChange,
  onSend,
  onCommandSelect,
  isTyping,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (text: string) => void;
  onCommandSelect: (command: string) => void;
  isTyping: boolean;
}) {
  return (
    <section className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {QUICK_COMMANDS.map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => onCommandSelect(command)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:border-teal-100 hover:bg-teal-50 hover:text-teal-700"
            >
              {command}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <Bot className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSend(input);
              }
            }}
            placeholder="Type a message or use / command..."
            className="h-10 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <Mic size={18} />
          </button>
          <button
            type="button"
            disabled={isTyping}
            onClick={() => onSend(input)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Send
            <SendHorizontal size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Your safety and privacy are our priority - AES-256</p>
          <p>Press Ctrl + K for shortcuts</p>
        </div>
      </div>
    </section>
  );
}
