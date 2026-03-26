import { ChatMessage } from "@/app/(features)/ai-companion/page";
import UserMessage from "./user-message";
import IntroAssistantCard from "./intro-assistant-card";
import AssistantTextCard from "./assistant-text-card";
import TypingIndicator from "./typing-indicator";
import InsightAssistantCard from "./insight-assistant-card";

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

export default function ConversationArea({
  messages,
  isTyping,
  onSuggestionStart,
}: {
  messages: ChatMessage[];
  isTyping: boolean;
  onSuggestionStart?: (command: string) => void;
}) {
  return (
    <section className="flex flex-1 flex-col gap-8 pb-28">
      {messages.map((message) => {
        const timestampLabel = formatMessageTimestamp(message.timestamp);

        if (message.role === "user") {
          return (
            <div key={message.id} className="flex flex-col items-end gap-2">
              <UserMessage text={message.text} />
              {timestampLabel ? (
                <p className="mr-10 text-[11px] text-slate-400">
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
            {timestampLabel || message.emotion || message.problem ? (
              <div className="ml-14 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                {timestampLabel ? <span>{timestampLabel}</span> : null}
                {message.emotion ? (
                  <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
                    Emotion: {message.emotion}
                  </span>
                ) : null}
                {message.problem ? (
                  <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 font-medium text-orange-700">
                    Focus: {message.problem}
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
