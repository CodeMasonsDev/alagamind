import { PanelLeft } from "lucide-react";

export default function TopBar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white py-3 pl-14 pr-4 sm:pr-6 lg:pl-8 lg:pr-8 dark:border-slate-800/90 dark:bg-slate-950/80 dark:backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Toggle conversations"
        >
          <PanelLeft size={20} />
        </button>

        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-slate-100">Companion</span>
        </div>
      </div>
    </header>
  );
}
