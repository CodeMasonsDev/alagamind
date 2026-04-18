import { Sparkles } from "lucide-react";

import { SUGGESTIONS } from "@/app/(features)/ai-companion/page";

import AssistantCard from "./assistant-card";
import SuggestionCard from "./suggestion-card";

export default function InsightAssistantCard({
  onSuggestionStart,
}: {
  onSuggestionStart: (command: string) => void;
}) {
  return (
    <AssistantCard>
      <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
          <Sparkles size={14} />
          Cognitive Insight
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          When unfinished tasks stay active in your mind, your thoughts can loop
          to keep searching for closure. That loop can make it harder for your
          nervous system to register safety and rest.
        </p>
      </div>

      <div className="mt-1">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
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
