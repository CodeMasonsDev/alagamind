import { Bot, Mic, SendHorizontal } from "lucide-react";

export default function Composer({
  input,
  onInputChange,
  onSend,
  isTyping,
  isDisabled = false,
  placeholder = "Type a message or use / command...",
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (text: string) => void;
  isTyping: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}) {
  return (
    <section className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <Bot className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            disabled={isDisabled}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isDisabled) {
                event.preventDefault();
                onSend(input);
              }
            }}
            placeholder={placeholder}
            className="h-10 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
          />
          <button
            type="button"
            disabled={isDisabled}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <Mic size={18} />
          </button>
          <button
            type="button"
            disabled={isTyping || isDisabled}
            onClick={() => onSend(input)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Send
            <SendHorizontal size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Your safety and privacy are our priority - AES-256</p>
          <p>Press Ctrl + K for shortcuts</p>
        </div>
      </div>
    </section>
  );
}
