import { ChatMessage } from "@/app/(features)/ai-companion/page";
import { Loader2, Play, Volume2 } from "lucide-react";
import UserMessage from "./user-message";
import IntroAssistantCard from "./intro-assistant-card";
import AssistantTextCard from "./assistant-text-card";
import TypingIndicator from "./typing-indicator";
import InsightAssistantCard from "./insight-assistant-card";

type MessageAudioState = {
  status: "idle" | "generating" | "ready" | "error";
  error: string | null;
};

function formatMessageTimestamp(timestamp?: string) {
  if (!timestamp) {
    return null;
  }

  const value = new Date(timestamp);
  if (Number.isNaN(value.getTime())) {
    return timestamp;
  }

  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resolveInsightLabels(language?: string | null) {
  switch ((language ?? "").toLowerCase()) {
    case "bisaya":
      return { emotion: "Emosyon", focus: "Pokus" };
    case "tagalog":
      return { emotion: "Emosyon", focus: "Pokus" };
    default:
      return { emotion: "Emotion", focus: "Focus" };
  }
}

function AssistantAudioButton({
  messageId,
  audioStatus = "idle",
  isPlaying = false,
  onPlayMessage,
}: {
  messageId: number;
  audioStatus?: MessageAudioState["status"];
  isPlaying?: boolean;
  onPlayMessage?: (messageId: number) => void;
}) {
  const playbackLabel =
    audioStatus === "generating"
      ? "Loading voice"
      : isPlaying
        ? "Stop voice playback"
        : "Play voice response";

  return (
    <button
      type="button"
      onClick={onPlayMessage ? () => onPlayMessage(messageId) : undefined}
      aria-label={playbackLabel}
      title={playbackLabel}
      disabled={!onPlayMessage || audioStatus === "generating"}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isPlaying
          ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/15 dark:text-teal-300"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800"
        }`}
    >
      {audioStatus === "generating" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isPlaying ? (
        <Volume2 size={14} />
      ) : (
        <Play size={14} className="translate-x-[1px]" />
      )}
    </button>
  );
}

export default function ConversationArea({
  messages,
  isTyping,
  streamingMessageId,
  userProfileImageUrl,
  userInitials,
  onSuggestionStart,
  messageAudio,
  currentlyPlayingId,
  onPlayMessage,
}: {
  messages: ChatMessage[];
  isTyping: boolean;
  streamingMessageId?: number | null;
  userProfileImageUrl?: string | null;
  userInitials?: string;
  onSuggestionStart?: (command: string) => void;
  messageAudio?: Record<number, MessageAudioState>;
  currentlyPlayingId?: number | null;
  onPlayMessage?: (messageId: number) => void;
}) {
  return (
    <section className="flex flex-1 flex-col justify-end gap-8 pb-6">
      {messages.map((message) => {
        const timestampLabel = formatMessageTimestamp(message.timestamp);
        const insightLabels = resolveInsightLabels(message.language);

        if (message.role === "user") {
          return (
            <div key={message.id} className="flex flex-col items-end gap-2">
              <UserMessage
                text={message.text}
                profileImageUrl={userProfileImageUrl}
                initials={userInitials}
              />
              {timestampLabel ? (
                <p className="mr-10 text-[11px] text-slate-400 dark:text-slate-500">
                  {timestampLabel}
                </p>
              ) : null}
            </div>
          );
        }

        if (message.kind === "intro") {
          return <IntroAssistantCard key={message.id} />;
        }

        if (message.kind === "insight") {
          return (
            <InsightAssistantCard
              key={message.id}
              onSuggestionStart={onSuggestionStart ?? (() => {})}
            />
          );
        }

        return (
          <div key={message.id} className="flex flex-col gap-3">
            <AssistantTextCard text={message.text} />
            {streamingMessageId === message.id ? null : timestampLabel ||
              message.emotion ||
              message.problem ||
              messageAudio?.[message.id]?.error ? (
              <div className="ml-14 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <AssistantAudioButton
                  messageId={message.id}
                  audioStatus={messageAudio?.[message.id]?.status ?? "idle"}
                  isPlaying={currentlyPlayingId === message.id}
                  onPlayMessage={onPlayMessage}
                />
                {timestampLabel ? <span>{timestampLabel}</span> : null}
                {message.emotion ? (
                  <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 font-medium text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                    {insightLabels.emotion}: {message.emotion}
                  </span>
                ) : null}
                {message.problem ? (
                  <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 font-medium text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                    {insightLabels.focus}: {message.problem}
                  </span>
                ) : null}
                {messageAudio?.[message.id]?.error ? (
                  <span className="text-rose-500 dark:text-rose-400">
                    {messageAudio[message.id]?.error}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}

      {isTyping ? <TypingIndicator /> : null}
    </section>
  );
}
