"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "./sidebar";

export default function SidebarShell() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close sidebar on route change (mobile navigation)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── Mobile hamburger trigger ── */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

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
