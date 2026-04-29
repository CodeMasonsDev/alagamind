"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronsUpDown,
  LoaderCircle,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { getMe, logout, type SessionUser } from "@/api/auth/auth";

const MHP_BASE = "/mentalhealth-professionals";

const NAV_ITEMS = [
  { label: "Clients", icon: Users, href: MHP_BASE },
  {
    label: "Session Registry",
    icon: BarChart3,
    href: `${MHP_BASE}/Session-registry`,
  },
  { label: "Settings", icon: Settings, href: `${MHP_BASE}/settings` },
];

export default function MHPSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getMe();
        console.log("✅ MHP user data loaded:", userData);
        setUser(userData);
      } catch (error) {
        console.error("❌ Failed to load MHP user data:", error);
      }
    };
    loadUser();
  }, []);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        isActive:
          item.href === MHP_BASE
            ? pathname === MHP_BASE
            : pathname.startsWith(item.href),
      })),
    [pathname],
  );

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setProfileMenuOpen(false);
      router.replace("/mentalhealth-professionals/login");
      router.refresh();
    }
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:border-white/5 dark:bg-[radial-gradient(circle_at_top_left,#17324d_0%,#0f172a_24%,#020617_100%)]">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
            <img
              src="/alagamind.png?v=2"
              alt="AlagaMind"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            AlagaMind
          </span>
        </div>
        <p className="mt-1 pl-[44px] text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-600 dark:text-teal-400">
          MHP Portal
        </p>
      </div>

      <div className="border-b border-slate-200 px-6 dark:border-white/5" />

      {/* Nav */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-3">
        <nav>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="relative group">
                  {item.isActive && (
                    <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-teal-500" />
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      item.isActive
                        ? "border border-slate-100/50 bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:ring-0"
                        : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon
                      strokeWidth={item.isActive ? 2.5 : 2}
                      className={`h-5 w-5 ${item.isActive ? "text-slate-800 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`}
                    />
                    <span
                      className={`text-sm ${item.isActive ? "font-semibold" : "font-medium"}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer */}
      <div
        ref={footerRef}
        className="relative mt-auto border-t border-slate-200 bg-transparent p-4 dark:border-white/5"
      >
        {profileMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              MHP Session
            </p>
            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user ? `${user.firstname} ${user.lastname}` : "Loading..."}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {user?.email || ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              {isLoggingOut ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Signing out
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </>
              )}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileMenuOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
              {user
                ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`
                : "MH"}
            </div>
            <div className="flex min-w-0 flex-col items-start">
              <span className="w-full truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user ? `${user.firstname} ${user.lastname}` : "Loading..."}
              </span>
              <span className="w-full max-w-[120px] truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                Mental Health Prof.
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
        </button>
      </div>
    </aside>
  );
}
