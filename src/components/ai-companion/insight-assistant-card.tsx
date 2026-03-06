import { SUGGESTIONS } from "@/app/(features)/ai-companion/page";
import AssistantCard from "./assistant-card";
import { Sparkles } from "lucide-react";
import SuggestionCard from "./suggestion-card";
export default function InsightAssistantCard({
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
    </AssistantCard>
  );
}
