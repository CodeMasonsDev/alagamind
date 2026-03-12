"use client";

import { Bot, Lightbulb, SendHorizontal, X } from "lucide-react";
import { CbtChatMessage } from "@/features/cognitive-reframing/cbt-chat-service";

type Props = {
  isOpen: boolean;
  currentStepTitle: string;
  currentStepIndex: number;
  isFinalStep: boolean;
  canGenerate: boolean;
  isGenerating: boolean;
  isReplying: boolean;
  messages: CbtChatMessage[];
  input: string;
  quickPrompts: string[];
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSendMessage: (value?: string) => void;
  onGenerate: () => void;
};

export default function CbtChatAssistantPanel({
  isOpen,
  currentStepTitle,
  currentStepIndex,
  isFinalStep,
  canGenerate,
  isGenerating,
  isReplying,
  messages,
  input,
  quickPrompts,
  onClose,
  onInputChange,
  onSendMessage,
  onGenerate,
}: Props) {
  const visibleQuickPrompts = quickPrompts.slice(0, 3);
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const perspectiveVariant = (currentStepIndex % 3) + 1;

  if (!isOpen) return null;

  return (
    <aside className="fixed bottom-5 left-4 right-4 top-20 z-50 flex flex-col rounded-2xl border border-slate-200 bg-[#f7f9fb] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.15)] sm:left-auto sm:w-[340px] lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto lg:top-0 lg:bottom-0 lg:w-[340px] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:shadow-none">
      <header className="flex items-start justify-between pb-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-700">
            <Bot size={14} />
          </span>
          <div>
            <p className="text-base font-extrabold tracking-tight text-slate-800">
              ReframAI
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-600">
              Your Supportive Cognitive Companion
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <X size={14} />
        </button>
      </header>

      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white">
            <Bot size={13} />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Alaga Facilitator
          </p>
        </div>

        <div className="relative mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600 shadow-sm">
          <span className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 border-b border-l border-slate-200 bg-white" />
          {latestAssistantMessage?.content ??
            `We are currently in ${currentStepTitle}. I can help you reflect before moving forward.`}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span className={`${isReplying ? "animate-pulse" : ""}`}>. . .</span>
          <span>{isReplying ? "Analyzing..." : "Analyzing Depth..."}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Quick Suggestions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {visibleQuickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSendMessage(prompt)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100/80 p-3">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600">
          <Lightbulb size={13} className="text-teal-600" />
          Perspective Variant {perspectiveVariant}/3
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {isFinalStep
            ? "Reframing this situation can lower emotional intensity while keeping your response realistic."
            : `Current focus: ${currentStepTitle}. We will build the reframe one step at a time.`}
        </p>
      </div>

      {isFinalStep ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-teal-600 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isGenerating ? "Generating..." : "Generate Step 6 Output"}
        </button>
      ) : null}

      <div className="mt-auto pt-5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Ask for guidance..."
            className="h-8 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => onSendMessage()}
            className="text-teal-600 transition-colors hover:text-teal-700"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
