import { ChatMessage } from "@/app/(features)/ai-companion/page";
import UserMessage from "./user-message";
import IntroAssistantCard from "./intro-assistant-card";
import AssistantTextCard from "./assistant-text-card";
import TypingIndicator from "./typing-indicator";
import InsightAssistantCard from "./insight-assistant-card";

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
              onSuggestionStart={onSuggestionStart ?? (() => {})}
            />
          );
        }

        return <AssistantTextCard key={message.id} text={message.text} />;
      })}

      {isTyping ? <TypingIndicator /> : null}
    </section>
  );
}
