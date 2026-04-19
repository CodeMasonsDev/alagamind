"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/ai-companion": "AI Companion",
  "/journals-reflections": "Journal & Reflections",
  "/journals-reflections/write": "Journal & Reflections",
  "/journals-reflections/archive": "Journal & Reflections",
  "/reframing": "Reframing & Insights",
  "/exercises": "Exercises & Protocols",
  "/exercises/grounding": "Exercises & Protocols",
  "/exercises/behavioral-activation": "Exercises & Protocols",
  "/exercises/cognitive-reframing": "Exercises & Protocols",
  "/insights": "Insights & Reports",
  "/settings": "Settings",
  "/help": "Help & Support",
};

function getRouteLabel(pathname: string): string {
  // Exact match first
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];

  // Prefix match for nested routes
  const match = Object.keys(ROUTE_LABELS)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  return match ? ROUTE_LABELS[match] : "AlagaMind";
}

export default function MobileTopBar() {
  const { setOpen } = useSidebar();
  const pathname = usePathname();
  const label = getRouteLabel(pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#122238] lg:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="h-4 w-4" />
      </button>

      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </header>
  );
}
