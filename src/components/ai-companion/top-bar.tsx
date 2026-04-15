import { Circle, Lock, Ellipsis, PanelLeft } from "lucide-react";

export default function TopBar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  return (
    <header className="flex sticky top-0 z-10 items-center justify-between border-b border-slate-200 bg-white pl-14 pr-4 py-3 sm:pr-6 lg:pl-8 lg:pr-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          title="Toggle conversations"
        >
          <PanelLeft size={20} />
        </button>

        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Companion</span>
        </div>
      </div>
    </header>
  );
}
