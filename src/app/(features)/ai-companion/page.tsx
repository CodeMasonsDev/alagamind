"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Composer from "@/components/ai-companion/composer";
import ConversationArea from "@/components/ai-companion/conversation-area";
import SessionSidebar from "@/components/ai-companion/session-sidebar";
import TopBar from "@/components/ai-companion/top-bar";
import { useDashboardMetrics } from "@/components/providers/dashboard-metrics-provider";
import { getMe, SessionUser } from "@/api/auth/auth";
import {
  createNewSession,
  fetchUserSessions,
  generateAssistantVoice,
  removeSession,
  sendChatStream,
} from "@/services/chat";
import {
  ChatRequest,
  LanguagePreference,
  SessionTurn,
  UserSession,
} from "@/types/ai-companion";

export type Suggestion = {
  title: string;
  description: string;
  duration: string;
  supportText: string;
  actionText: string;
  command: string;
};

type ChatMessageBase = {
  id: number;
  timestamp?: string;
  emotion?: string | null;
  problem?: string | null;
  language?: string | null;
};

export type ChatMessage =
  | (ChatMessageBase & { role: "user"; text: string })
  | (ChatMessageBase & {
      role: "assistant";
      kind: "text";
      text: string;
    })
  | (ChatMessageBase & { role: "assistant"; kind: "intro" })
  | (ChatMessageBase & { role: "assistant"; kind: "insight" });

type AppendableChatMessage = Omit<ChatMessage, "id">;

type AudioPlaybackStatus = "idle" | "generating" | "ready" | "error";

type MessageAudioState = {
  status: AudioPlaybackStatus;
  error: string | null;
};

export const SUGGESTIONS: Suggestion[] = [];
const LANGUAGE_PREFERENCE_STORAGE_KEY =
  "ai-companion.language-preference";

function isLanguagePreference(value: unknown): value is LanguagePreference {
  return (
    value === "auto" ||
    value === "english" ||
    value === "bisaya" ||
    value === "tagalog"
  );
}

function readStoredLanguagePreference() {
  if (typeof window === "undefined") {
    return "auto" as const;
  }

  const storedValue = window.localStorage.getItem(
    LANGUAGE_PREFERENCE_STORAGE_KEY,
  );

  return isLanguagePreference(storedValue) ? storedValue : "auto";
}

function sortSessionsByUpdatedAt(nextSessions: UserSession[]) {
  return [...nextSessions].sort((left, right) => {
    const leftTime = new Date(left.updated_at).getTime();
    const rightTime = new Date(right.updated_at).getTime();

    if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
      return right.updated_at.localeCompare(left.updated_at);
    }

    return rightTime - leftTime;
  });
}

function buildMessagesFromHistory(
  session: UserSession | null | undefined,
): AppendableChatMessage[] {
  if (!session || session.history.length === 0) {
    return [];
  }

  return session.history.flatMap((turn: SessionTurn) => [
    {
      role: "user" as const,
      text: turn.user,
      timestamp: turn.timestamp,
      emotion: turn.emotion,
      problem: turn.problem,
      language: turn.language,
    },
    {
      role: "assistant" as const,
      kind: "text" as const,
      text: turn.ai,
      timestamp: turn.timestamp,
      emotion: turn.emotion,
      problem: turn.problem,
      language: turn.language,
    },
  ]);
}

function buildEmptySession(sessionId: string, userId: string): UserSession {
  const now = new Date().toISOString();

  return {
    session_id: sessionId,
    user_id: userId,
    created_at: now,
    updated_at: now,
    turn_count: 0,
    history: [],
  };
}

export default function AiCompanionPage() {
  const { refreshFocusMomentum } = useDashboardMetrics();

  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [languagePreference, setLanguagePreference] =
    useState<LanguagePreference>(readStoredLanguagePreference);
  const [isTyping, setIsTyping] = useState(false);
  const [messageAudio, setMessageAudio] = useState<
    Record<number, MessageAudioState>
  >({});
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(
    null,
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const nextIdRef = useRef(1);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedSessionIdRef = useRef("");
  const messageAudioRef = useRef<Record<number, MessageAudioState>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const decodedAudioRef = useRef<Record<number, AudioBuffer>>({});
  const audioRequestRef = useRef<Record<number, Promise<AudioBuffer | null>>>(
    {},
  );

  const selectedSession = useMemo(
    () =>
      sessions.find((session) => session.session_id === selectedSessionId) ??
      null,
    [selectedSessionId, sessions],
  );

  const hasNoSessions =
    !isLoadingProfile &&
    !isLoadingSessions &&
    !sessionsError &&
    sessions.length === 0;

  const stopCurrentAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    setCurrentlyPlayingId(null);
  }, []);

  const setMessagesFromSession = useCallback(
    (session: UserSession | null | undefined) => {
      const nextMessages = buildMessagesFromHistory(session);
      nextIdRef.current = 1;
      setMessages(
        nextMessages.map((message) => ({
          ...message,
          id: nextIdRef.current++,
        })),
      );
      setMessageAudio({});
      messageAudioRef.current = {};
      stopCurrentAudio();
      decodedAudioRef.current = {};
      audioRequestRef.current = {};
      setCurrentlyPlayingId(null);
    },
    [stopCurrentAudio],
  );

  const syncSessionSelection = useCallback(
    (nextSessions: UserSession[], preferredSessionId?: string | null) => {
      if (nextSessions.length === 0) {
        selectedSessionIdRef.current = "";
        setSelectedSessionId("");
        setMessages([]);
        nextIdRef.current = 1;
        return;
      }

      const nextSession =
        nextSessions.find(
          (session) => session.session_id === preferredSessionId,
        ) ?? nextSessions[0];

      selectedSessionIdRef.current = nextSession.session_id;
      setSelectedSessionId(nextSession.session_id);
      setMessagesFromSession(nextSession);
    },
    [setMessagesFromSession],
  );

  const refetchSessions = useCallback(
    async (preferredSessionId?: string, showLoading = true) => {
      if (!profile?.id) {
        setIsLoadingSessions(false);
        return;
      }

      if (showLoading) {
        setIsLoadingSessions(true);
      }
      setSessionsError(null);

      try {
        const data = await fetchUserSessions(profile.id);
        const nextSessions = sortSessionsByUpdatedAt(data.sessions);
        setSessions(nextSessions);

        if (nextSessions.length === 0) {
          syncSessionSelection([]);
          return;
        }

        const shouldSyncSelection =
          showLoading || typeof preferredSessionId !== "undefined";

        if (shouldSyncSelection) {
          syncSessionSelection(
            nextSessions,
            preferredSessionId ?? selectedSessionIdRef.current,
          );
          return;
        }

        if (
          selectedSessionIdRef.current &&
          nextSessions.some(
            (session) => session.session_id === selectedSessionIdRef.current,
          )
        ) {
          return;
        }

        syncSessionSelection(nextSessions);
      } catch {
        setSessionsError("Unable to load conversations. Please try again.");
        if (showLoading) {
          setSessions([]);
          syncSessionSelection([]);
        }
      } finally {
        setIsLoadingSessions(false);
      }
    },
    [profile?.id, syncSessionSelection],
  );

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setIsLoadingProfile(true);

      try {
        const currentUser = await getMe();
        if (!isMounted) {
          return;
        }

        setProfile(currentUser);
      } catch {
        if (!isMounted) {
          return;
        }

        setProfile(null);
        setSessions([]);
        syncSessionSelection([]);
        setSessionsError("Unable to load your account session.");
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [syncSessionSelection]);

  useEffect(() => {
    if (!profile?.id) {
      if (!isLoadingProfile) {
        setIsLoadingSessions(false);
      }
      return;
    }

    void refetchSessions();
  }, [isLoadingProfile, profile?.id, refetchSessions]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      LANGUAGE_PREFERENCE_STORAGE_KEY,
      languagePreference,
    );
  }, [languagePreference]);

  useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId;
  }, [selectedSessionId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [isTyping, messages]);

  const appendMessage = useCallback((message: AppendableChatMessage) => {
    const nextId = nextIdRef.current++;

    setMessages((current) => [...current, { ...message, id: nextId }]);

    return nextId;
  }, []);

  const updateMessageById = useCallback(
    (messageId: number, updater: (message: ChatMessage) => ChatMessage) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? updater(message) : message,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    messageAudioRef.current = messageAudio;
  }, [messageAudio]);

  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }

      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const updateMessageAudioState = useCallback(
    (
      messageId: number,
      updater: (current?: MessageAudioState) => MessageAudioState,
    ) => {
      setMessageAudio((current) => {
        const nextState = updater(current[messageId]);
        const nextCollection = {
          ...current,
          [messageId]: nextState,
        };

        messageAudioRef.current = nextCollection;

        return nextCollection;
      });
    },
    [],
  );

  const ensureAudioContext = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const loadMessageAudio = useCallback(
    async (
      message: Extract<ChatMessage, { role: "assistant"; kind: "text" }>,
    ) => {
      const existingBuffer = decodedAudioRef.current[message.id] ?? null;
      if (existingBuffer) {
        return existingBuffer;
      }

      const inFlightRequest = audioRequestRef.current[message.id];
      if (inFlightRequest) {
        return inFlightRequest;
      }

      updateMessageAudioState(message.id, () => ({
        status: "generating",
        error: null,
      }));

      const request = (async () => {
        try {
          const [audioContext, audioBytes] = await Promise.all([
            ensureAudioContext(),
            generateAssistantVoice({
              text: message.text,
              language: message.language,
            }),
          ]);

          if (!audioContext) {
            throw new Error("AudioContext is unavailable");
          }

          const decodedBuffer = await audioContext.decodeAudioData(
            audioBytes.slice(0),
          );
          decodedAudioRef.current[message.id] = decodedBuffer;

          updateMessageAudioState(message.id, () => ({
            status: "ready",
            error: null,
          }));

          return decodedBuffer;
        } catch (error) {
          console.error("Failed to generate assistant audio:", error);

          updateMessageAudioState(message.id, () => ({
            status: "error",
            error: "Voice playback unavailable",
          }));

          return null;
        } finally {
          delete audioRequestRef.current[message.id];
        }
      })();

      audioRequestRef.current[message.id] = request;

      return request;
    },
    [ensureAudioContext, updateMessageAudioState],
  );

  const playMessageAudio = useCallback(
    async (
      message: Extract<ChatMessage, { role: "assistant"; kind: "text" }>,
    ) => {
      let resolvedBuffer = decodedAudioRef.current[message.id] ?? null;

      if (currentlyPlayingId === message.id && audioSourceRef.current) {
        stopCurrentAudio();
        return;
      }

      if (!resolvedBuffer) {
        resolvedBuffer = await loadMessageAudio(message);
      }

      if (!resolvedBuffer) {
        return;
      }

      const audioContext = await ensureAudioContext();
      if (!audioContext) {
        updateMessageAudioState(message.id, () => ({
          status: "error",
          error: "Voice playback unavailable",
        }));
        return;
      }

      stopCurrentAudio();

      const source = audioContext.createBufferSource();
      source.buffer = resolvedBuffer;
      source.connect(audioContext.destination);
      audioSourceRef.current = source;
      setCurrentlyPlayingId(message.id);

      source.onended = () => {
        if (audioSourceRef.current === source) {
          audioSourceRef.current.disconnect();
          audioSourceRef.current = null;
        }
        setCurrentlyPlayingId(null);
      };

      try {
        source.start(0);
      } catch (error) {
        console.error("Failed to play assistant audio:", error);
        if (audioSourceRef.current === source) {
          audioSourceRef.current.disconnect();
          audioSourceRef.current = null;
        }
        setCurrentlyPlayingId(null);

        updateMessageAudioState(message.id, () => ({
          status: decodedAudioRef.current[message.id] ? "ready" : "error",
          error: decodedAudioRef.current[message.id] ? null : "Playback failed",
        }));
      }
    },
    [
      currentlyPlayingId,
      ensureAudioContext,
      loadMessageAudio,
      stopCurrentAudio,
      updateMessageAudioState,
    ],
  );

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    const activeSessionId = selectedSessionIdRef.current;

    if (!trimmed || isTyping || !activeSessionId) {
      return;
    }

    const optimisticTimestamp = new Date().toISOString();

    appendMessage({
      role: "user",
      text: trimmed,
      timestamp: optimisticTimestamp,
    });
    let assistantMessageId: number | null = null;

    const ensureAssistantMessage = (initialText = "") => {
      if (assistantMessageId !== null) {
        return assistantMessageId;
      }

      assistantMessageId = appendMessage({
        role: "assistant",
        kind: "text",
        text: initialText,
        timestamp: optimisticTimestamp,
      });

      return assistantMessageId;
    };

    setInput("");
    setIsTyping(true);
    await ensureAudioContext();

    try {
      const chatRequest: ChatRequest = {
        user_message: trimmed,
        session_id: activeSessionId,
        user_id: profile?.id,
        language_preference: languagePreference,
      };

      await sendChatStream(chatRequest, {
        onDelta: ({ text: delta }) => {
          if (delta) {
            const messageId = ensureAssistantMessage();
            setIsTyping(false);

            updateMessageById(messageId, (message) => {
              if (message.role !== "assistant" || message.kind !== "text") {
                return message;
              }

              return {
                ...message,
                text: `${message.text}${delta}`,
                timestamp: optimisticTimestamp,
              };
            });
          }
        },
        onReplace: ({ text: replacement }) => {
          const messageId = ensureAssistantMessage(replacement);
          setIsTyping(false);
          updateMessageById(messageId, (message) => {
            if (message.role !== "assistant" || message.kind !== "text") {
              return message;
            }

            return {
              ...message,
              text: replacement,
              timestamp: optimisticTimestamp,
            };
          });
        },
        onDone: async (response) => {
          setIsTyping(false);
          if (response.language_preference) {
            setLanguagePreference(response.language_preference);
          }
          const messageId = ensureAssistantMessage(response.response);
          updateMessageById(messageId, (message) => {
            if (message.role !== "assistant" || message.kind !== "text") {
              return message;
            }

            return {
              ...message,
              text: response.response,
              timestamp: optimisticTimestamp,
              emotion: response.emotion,
              problem: response.problem,
              language: response.language,
            };
          });

          if (profile?.id) {
            void refreshFocusMomentum(profile.id);
          }

          await refetchSessions(activeSessionId, false);
        },
      });
    } catch (error) {
      console.error("Failed to get assistant response:", error);
      const fallbackText =
        "I'm sorry, I had trouble responding. Please try again.";

      if (assistantMessageId === null) {
        appendMessage({
          role: "assistant",
          kind: "text",
          text: fallbackText,
          timestamp: optimisticTimestamp,
        });
        return;
      }

      updateMessageById(assistantMessageId, (message) => {
        if (message.role !== "assistant" || message.kind !== "text") {
          return message;
        }

        return {
          ...message,
          text: message.text.trim() || fallbackText,
          timestamp: optimisticTimestamp,
        };
      });
    } finally {
      setIsTyping(false);
    }
  }

  async function handleNewSession() {
    if (!profile?.id || isCreatingSession) {
      return;
    }

    setIsCreatingSession(true);
    setSessionsError(null);

    try {
      const newSession = await createNewSession();
      const nextSession = buildEmptySession(newSession.session_id, profile.id);
      const nextSessions = sortSessionsByUpdatedAt([nextSession, ...sessions]);

      setSessions(nextSessions);
      syncSessionSelection(nextSessions, nextSession.session_id);
      setInput("");
      setIsSidebarOpen(true);
    } catch (error) {
      console.error("Failed to create session:", error);
      setSessionsError(
        "Unable to create a new conversation. Please try again.",
      );
    } finally {
      setIsCreatingSession(false);
    }
  }

  function handleSelectSession(id: string) {
    if (id === selectedSessionIdRef.current) {
      return;
    }

    const target = sessions.find((session) => session.session_id === id);
    if (!target) {
      return;
    }

    selectedSessionIdRef.current = target.session_id;
    setSelectedSessionId(target.session_id);
    setMessagesFromSession(target);
  }

  async function handleDeleteSession(id: string) {
    try {
      await removeSession(id);
    } catch (error) {
      console.error("Failed to delete session from API:", error);
      setSessionsError("Unable to delete the conversation. Please try again.");
      return;
    }

    const remainingSessions = sessions.filter(
      (session) => session.session_id !== id,
    );
    const nextPreferredId =
      id === selectedSessionIdRef.current
        ? remainingSessions[0]?.session_id
        : selectedSessionIdRef.current;

    await refetchSessions(nextPreferredId);
  }

  function handleRetry() {
    if (!profile?.id) {
      return;
    }

    void refetchSessions();
  }

  return (
    <div className="flex h-screen w-full bg-slate-50/60">
      <SessionSidebar
        sessions={sessions}
        activeSessionId={selectedSessionId}
        isOpen={isSidebarOpen}
        isCreating={isCreatingSession}
        isLoading={isLoadingProfile || isLoadingSessions}
        error={sessionsError}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onClose={() => setIsSidebarOpen(false)}
        onRetry={handleRetry}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />

        <main
          ref={scrollContainerRef}
          className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
        >
          {isLoadingProfile || isLoadingSessions ? (
            <ConversationPanelSkeleton />
          ) : sessionsError && !profile ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-red-500">
                Unable to load your account session.
              </p>
            </div>
          ) : sessionsError && sessions.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-red-500">{sessionsError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800"
              >
                Retry
              </button>
            </div>
          ) : hasNoSessions ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="text-lg font-semibold text-slate-500">
                No conversations yet
              </p>
              <p className="max-w-md text-sm leading-relaxed text-slate-400">
                Start a new conversation to begin chatting with your AI
                companion.
              </p>
              <button
                type="button"
                onClick={handleNewSession}
                disabled={isCreatingSession}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isCreatingSession ? "Creating..." : "Start a conversation"}
              </button>
            </div>
          ) : messages.length === 0 && !isTyping && selectedSession ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="text-lg font-semibold text-slate-500">
                This conversation is empty
              </p>
              <p className="text-sm text-slate-400">
                Send a message to start chatting in this session.
              </p>
            </div>
          ) : (
            <ConversationArea
              messages={messages}
              isTyping={isTyping}
              messageAudio={messageAudio}
              currentlyPlayingId={currentlyPlayingId}
              onPlayMessage={(messageId) => {
                const targetMessage = messages.find(
                  (
                    message,
                  ): message is Extract<
                    ChatMessage,
                    { role: "assistant"; kind: "text" }
                  > =>
                    message.id === messageId &&
                    message.role === "assistant" &&
                    message.kind === "text",
                );

                if (!targetMessage) {
                  return;
                }

                void playMessageAudio(targetMessage);
              }}
            />
          )}
        </main>

        <Composer
          input={input}
          onInputChange={setInput}
          languagePreference={languagePreference}
          onLanguagePreferenceChange={setLanguagePreference}
          onSend={sendMessage}
          isTyping={isTyping || isLoadingProfile || isLoadingSessions}
          isDisabled={!selectedSessionId || isCreatingSession || !profile}
          placeholder={
            selectedSessionId
              ? "Share what's on your mind, or record a voice note..."
              : "Create a new conversation to start chatting..."
          }
        />
      </div>
    </div>
  );
}

function ConversationPanelSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div className="w-full max-w-3xl animate-pulse space-y-3">
            <div className="h-3 w-24 rounded-full bg-slate-200" />
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-2/3 rounded-full bg-slate-200" />
              <div className="h-4 w-full rounded-full bg-slate-100" />
              <div className="h-4 w-4/5 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
