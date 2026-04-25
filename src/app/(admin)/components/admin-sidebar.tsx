"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, Menu } from "lucide-react";
import { getMe, logout, type SessionUser } from "@/api/auth/auth";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    router.replace("/admin/login");
  };

  const userInitials = user
    ? `${user.firstName?.[0] ?? "A"}${user.lastName?.[0] ?? "D"}`.toUpperCase()
    : "AD";

  return (
    <aside className="w-60 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-200 px-6 py-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-sm">
            🔐
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              AlagaMind
            </h1>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wide">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "border border-slate-100/50 bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 dark:bg-white/5 dark:border-slate-700 dark:text-white dark:ring-0"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 h-8 w-1 rounded-r-full bg-teal-500" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="shrink-0 border-t border-slate-200 px-3 py-4 dark:border-slate-800">
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xs font-bold">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </button>

          {profileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-10">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                    Signing out...
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
        </div>
      </div>
    </aside>
  );
}
