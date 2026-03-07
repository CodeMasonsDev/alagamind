"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Composer from "@/components/ai-companion/composer";
import TopBar from "@/components/ai-companion/top-bar";
import ConversationArea from "@/components/ai-companion/conversation-area";
import SessionSidebar from "@/components/ai-companion/session-sidebar";
import { GetChats, sendChat, createNewSession, removeSession } from "@/services/chat";
import { ChatRequest, SessionListItem } from "@/types/ai-companion";

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

const SESSIONS_STORAGE_KEY = "alagamind_sessions";
const ACTIVE_SESSION_KEY = "alagamind_active_session";

function loadSessionsFromStorage(): SessionListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessionsToStorage(sessions: SessionListItem[]) {
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

function loadActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

function saveActiveSessionId(id: string) {
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
}

export default function AiCompanionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  const nextIdRef = useRef(1);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  // ─── Initialize: load sessions from localStorage or auto-create one ───
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function init() {
      const stored = loadSessionsFromStorage();
      const savedActiveId = loadActiveSessionId();

      if (stored.length > 0) {
        setSessions(stored);
        const startId =
          savedActiveId && stored.some((s) => s.id === savedActiveId)
            ? savedActiveId
            : stored[0].id;
        setActiveSessionId(startId);
        saveActiveSessionId(startId);
        await loadHistory(startId);
      } else {
        // First visit — create a session automatically
        try {
          const newSession = await createNewSession();
          const item: SessionListItem = {
            id: newSession.session_id,
            label: "New conversation",
            createdAt: new Date().toISOString(),
          };
          setSessions([item]);
          setActiveSessionId(item.id);
          saveSessionsToStorage([item]);
          saveActiveSessionId(item.id);
        } catch (error) {
          console.error("Failed to auto-create session:", error);
        }
        setIsLoadingHistory(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load chat history for a session ────────────────────────────────
  async function loadHistory(sessionId: string) {
    setIsLoadingHistory(true);
    nextIdRef.current = 1;
    try {
      const history = await GetChats(sessionId);
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
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  // ─── Auto-scroll when messages or typing state change ──────────────
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

  // ─── Append a single message to the conversation ──────────────────
  function appendMessage(message: ChatMessage) {
    setMessages((prev) => [...prev, { ...message, id: nextIdRef.current++ }]);
  }

  // ─── Update the session label (used after first user message) ──────
  const updateSessionLabel = useCallback(
    (sessionId: string, label: string) => {
      setSessions((prev) => {
        const truncated = label.length > 40 ? label.slice(0, 40) + "…" : label;
        const updated = prev.map((s) =>
          s.id === sessionId ? { ...s, label: truncated } : s,
        );
        saveSessionsToStorage(updated);
        return updated;
      });
    },
    [],
  );

  // ─── Send a message ─────────────────────────────────────────────────
  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping || !activeSessionId) return;

    // If this is the first message, update the session label
    if (messages.length === 0) {
      updateSessionLabel(activeSessionId, trimmed);
    }

    appendMessage({ id: 0, role: "user", text: trimmed });
    setInput("");
    setIsTyping(true);

    try {
      const chatRequest: ChatRequest = {
        user_message: trimmed,
        session_id: activeSessionId,
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

  // ─── Session actions ───────────────────────────────────────────────
  async function handleNewSession() {
    setIsCreatingSession(true);
    try {
      const newSession = await createNewSession();
      const item: SessionListItem = {
        id: newSession.session_id,
        label: "New conversation",
        createdAt: new Date().toISOString(),
      };

      setSessions((prev) => {
        const updated = [item, ...prev];
        saveSessionsToStorage(updated);
        return updated;
      });

      setActiveSessionId(item.id);
      saveActiveSessionId(item.id);
      setMessages([]);
      nextIdRef.current = 1;
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreatingSession(false);
    }
  }

  async function handleSelectSession(id: string) {
    if (id === activeSessionId) return;
    setActiveSessionId(id);
    saveActiveSessionId(id);
    await loadHistory(id);
  }

  async function handleDeleteSession(id: string) {
    try {
      await removeSession(id);
    } catch (error) {
      console.error("Failed to delete session from API:", error);
      // Continue with local removal even if API fails
    }

    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessionsToStorage(updated);

      // If we deleted the active session, switch to the first remaining one
      if (id === activeSessionId) {
        if (updated.length > 0) {
          const nextId = updated[0].id;
          setActiveSessionId(nextId);
          saveActiveSessionId(nextId);
          loadHistory(nextId);
        } else {
          // No sessions left — create a new one
          setActiveSessionId("");
          setMessages([]);
          handleNewSession();
        }
      }

      return updated;
    });
  }

  return (
    <div className="flex h-screen w-full bg-slate-50/60">
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        isCreating={isCreatingSession}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onToggleSidebar={() => setIsSidebarOpen((o) => !o)} />

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
    </div>
  );
}
