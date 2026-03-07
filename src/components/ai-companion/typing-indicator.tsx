import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* Bot avatar */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-teal-600">
        <Bot size={16} />
      </span>

      {/* Compact dot bubble */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="block h-2.5 w-2.5 rounded-full bg-teal-500 animate-[typing-bounce_1s_ease-in-out_infinite]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-teal-500 animate-[typing-bounce_1s_ease-in-out_0.15s_infinite]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-teal-500 animate-[typing-bounce_1s_ease-in-out_0.3s_infinite]" />
        </div>
      </div>
    </div>
  );
}
