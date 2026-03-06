import { Circle, Lock, Ellipsis } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex sticky top-0 z-10   items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        <span className="text-slate-900">Conversation Flow</span>
        <span className="text-slate-300">/</span>
        <span className="flex items-center gap-1.5 text-orange-600">
          <Circle className="h-2.5 w-2.5 fill-current" />
          Status: Supportive Interaction
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          <Lock size={12} />
          Secure Connection
        </span>
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Ellipsis size={18} />
        </button>
      </div>
    </header>
  );
}
