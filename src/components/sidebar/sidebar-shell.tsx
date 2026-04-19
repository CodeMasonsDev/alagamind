"use client";

import { X } from "lucide-react";
import Sidebar from "./sidebar";
import { useSidebar } from "./sidebar-context";

export default function SidebarShell() {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* ── Sidebar container ── */}
      {/* Desktop: static sidebar always visible */}
      {/* Mobile: slides in from the left as overlay */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 h-full w-60 transform transition-transform duration-300 ease-out
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile close button */}
        {open && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <Sidebar />
      </aside>
    </>
  );
}
