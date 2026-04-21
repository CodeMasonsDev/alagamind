"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { askEddy, EddyConversationTurn, EddyLanguage } from "@/api/eddy";
import { getMe } from "@/api/auth/auth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EddyModalProps {
  selectedText: string;
  fullJournalText: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

export default function EddyModal({
  selectedText,
  fullJournalText,
  anchorRect,
  onClose,
}: EddyModalProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [language, setLanguage] = useState<EddyLanguage>("en");
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const initialPos = anchorRect
    ? calculateModalPosition(anchorRect)
    : { top: 80, left: 80 };
  const [pos, setPos] = useState({ x: initialPos.left, y: initialPos.top });

  const truncatedText =
    selectedText.length > 120
      ? `${selectedText.slice(0, 120).trimEnd()}…`
      : selectedText;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    void getMe()
      .then((user) => setUserId(user?.id ?? null))
      .catch(() => null);
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const modalWidth = 320;
      const modalMaxHeight = 520;
      const margin = 8;
      const newX = Math.max(
        margin,
        Math.min(
          e.clientX - dragOffsetRef.current.x,
          window.innerWidth - modalWidth - margin,
        ),
      );
      const newY = Math.max(
        margin,
        Math.min(
          e.clientY - dragOffsetRef.current.y,
          window.innerHeight - modalMaxHeight - margin,
        ),
      );
      setPos({ x: newX, y: newY });
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMobile || !modalRef.current) return;
    isDraggingRef.current = true;
    const rect = modalRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  };

  const handleSend = useCallback(async () => {
    if (!question.trim() || isStreaming) return;

    const userQuestion = question.trim();
    setQuestion("");
    setError(null);

    const newUserMessage: Message = { role: "user", content: userQuestion };
    setMessages((prev) => [...prev, newUserMessage]);
    setStreamingContent("");

    const history: EddyConversationTurn[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    let accumulated = "";

    try {
      await askEddy(
        {
          user_id: userId ?? "",
          selected_text: selectedText,
          user_question: userQuestion,
          language,
          full_journal_text: fullJournalText,
          conversation_history: history,
        },
        (chunk) => {
          accumulated += chunk;
          setStreamingContent(accumulated);
        },
        controller.signal,
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: accumulated },
      ]);
      setStreamingContent("");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setStreamingContent("");
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [
    question,
    isStreaming,
    messages,
    selectedText,
    language,
    fullJournalText,
    userId,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
    if (e.key === "Escape") onClose();
  };

  const inner = (
    <>
      {/* Header */}
      <div
        className={`flex shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-900 ${
          !isMobile ? "cursor-grab active:cursor-grabbing select-none" : ""
        }`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-xs font-bold text-white shadow-sm">
            E
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Eddia
          </span>
          <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-600 dark:bg-teal-900/40 dark:text-teal-400">
            AI Writing Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Selected text preview */}
      {selectedText && (
        <div className="mx-4 mt-3 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Selected text
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            &ldquo;{truncatedText}&rdquo;
          </p>
        </div>
      )}

      {!selectedText && messages.length === 0 && !streamingContent && (
        <div className="mx-4 mt-3 shrink-0 rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2.5 dark:border-teal-900/40 dark:bg-teal-950/30">
          <p className="text-xs leading-relaxed text-teal-700 dark:text-teal-300">
            Ask me anything about your journal — I can help you reflect, expand
            your ideas, or explore your emotions.
          </p>
        </div>
      )}

      {/* Conversation */}
      {(messages.length > 0 || streamingContent || error) && (
        <div
          ref={scrollRef}
          className="mx-4 mt-3 max-h-64 min-h-0 overflow-y-auto"
        >
          <div className="flex flex-col gap-3 pb-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? "flex justify-end" : ""}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-teal-500 to-teal-600 px-3 py-2 shadow-sm">
                    <p className="text-xs leading-relaxed text-white">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                      {msg.content}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {streamingContent && (
              <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {streamingContent}
                  <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-teal-500 align-middle" />
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 dark:border-red-900/30 dark:bg-red-950/30">
                <p className="text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 pt-3">
        <div className="mb-2.5">
          <label
            htmlFor="Eddia-language"
            className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            Response language
          </label>
          <select
            id="Eddia-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as EddyLanguage)}
            disabled={isStreaming}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-teal-500"
          >
            <option value="en">English</option>
            <option value="tl">Tagalog</option>
            <option value="ceb">Bisaya</option>
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition-all focus-within:border-teal-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-400/15 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-teal-500 dark:focus-within:bg-slate-800">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length > 0
                ? "Ask a follow-up…"
                : selectedText
                  ? "Ask Eddia about this text…"
                  : "Ask Eddia anything…"
            }
            disabled={isStreaming}
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50 dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!question.trim() || isStreaming}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white shadow-sm transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isStreaming ? (
              <svg
                className="h-3 w-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {isMobile ? (
        /* Mobile: bottom sheet */
        <div
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          style={{ maxHeight: "85dvh" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 justify-center pb-1 pt-2.5">
            <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          {inner}
        </div>
      ) : (
        /* Desktop: draggable floating modal */
        <div
          ref={modalRef}
          className="fixed z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-0"
          style={{ top: pos.y, left: pos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {inner}
        </div>
      )}
    </>
  );
}

function calculateModalPosition(anchorRect: DOMRect) {
  const modalWidth = 320;
  const modalMaxHeight = 520;
  const margin = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = anchorRect.bottom + margin;
  let left = anchorRect.left + anchorRect.width / 2 - modalWidth / 2;

  if (anchorRect.bottom + margin + modalMaxHeight > viewportHeight) {
    top = anchorRect.top - margin - modalMaxHeight;
  }

  top = Math.max(margin, top);
  left = Math.max(margin, Math.min(left, viewportWidth - modalWidth - margin));

  return { top, left };
}
