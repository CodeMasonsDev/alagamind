import { WandSparkles } from "lucide-react";

import { Suggestion } from "@/app/(features)/ai-companion/page";

export default function SuggestionCard({
  suggestion,
  onStart,
}: {
  suggestion: Suggestion;
  onStart: (command: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-slate-700 dark:hover:shadow-black/20">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-100">
        {suggestion.title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {suggestion.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="text-slate-900 dark:text-slate-100">{suggestion.duration}</span> (
          {suggestion.supportText})
        </p>
        <button
          type="button"
          onClick={() => onStart(suggestion.command)}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 transition-colors hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200"
        >
          {suggestion.actionText}
          <WandSparkles size={14} />
        </button>
      </div>
    </div>
  );
}
