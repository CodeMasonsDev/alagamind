"use client";

import { useEffect, useRef, useState } from "react";

import Composer from "@/components/ai-companion/composer";
import TopBar from "@/components/ai-companion/top-bar";
import ConversationArea from "@/components/ai-companion/conversation-area";
import { GetChats, sendChat } from "@/services/chat";
import { ChatRequest } from "@/types/ai-companion";

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
  | { id: number; role: "assistant"; kind: "text"; text: string }
  | { id: number; role: "assistant"; kind: "intro" }
  | { id: number; role: "assistant"; kind: "insight" };

export const SUGGESTIONS: Suggestion[] = [];

const SESSION_ID = "session123";

export default function AiCompanionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const nextIdRef = useRef(1);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await GetChats(SESSION_ID);

        const loaded: ChatMessage[] = history.flatMap((entry) => [
          {
            id: nextIdRef.current++,
            role: "user" as const,
            text: entry.user,
          },
          {
            id: nextIdRef.current++,
            role: "assistant" as const,
            kind: "text" as const,
            text: entry.ai,
          },
        ]);

        setMessages(loaded);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // Start fresh if history can't be fetched
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadHistory();
  }, []);

  // Auto-scroll when messages or typing state change
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

  function appendMessage(message: ChatMessage) {
    setMessages((prev) => [...prev, { ...message, id: nextIdRef.current++ }]);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    appendMessage({ id: 0, role: "user", text: trimmed });
    setInput("");
    setIsTyping(true);

    try {
      const chatRequest: ChatRequest = {
        user_message: trimmed,
        session_id: SESSION_ID,
      };

      const res = await sendChat(chatRequest);

      appendMessage({
        id: 0,
        role: "assistant",
        kind: "text",
        text: res.response,
      });
    } catch (error) {
      console.error("Failed to get assistant response:", error);
      appendMessage({
        id: 0,
        role: "assistant",
        kind: "text",
        text: "I'm sorry, I had trouble responding. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50/60">
      <TopBar />

      <main
        ref={scrollContainerRef}
        className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        {isLoadingHistory ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            Loading conversation...
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-semibold text-slate-500">No chats yet</p>
            <p className="text-sm text-slate-400">
              Send a message to start a conversation with your AI companion.
            </p>
          </div>
        ) : (
          <ConversationArea messages={messages} isTyping={isTyping} />
        )}
      </main>

      <Composer
        input={input}
        onInputChange={setInput}
        onSend={sendMessage}
        isTyping={isTyping || isLoadingHistory}
      />
    </div>
  );
}
