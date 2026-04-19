import { PanelLeft } from "lucide-react";

export default function TopBar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center border-b border-slate-200 bg-white py-3 pl-4 pr-4 sm:pr-6 lg:pl-8 lg:pr-8 dark:border-slate-800/90  dark:bg-[#122238]">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        title="Toggle conversations"
      >
        <PanelLeft size={20} />
      </button>
    </header>
  );
}
