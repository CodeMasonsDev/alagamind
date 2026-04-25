"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronsUpDown,
  Dumbbell,
  HelpCircle,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageSquare,
  Settings,
  UserSearch,
} from "lucide-react";
import { getMe, logout, type SessionUser } from "@/api/auth/auth";
import ProfileAvatar from "@/components/shared/profile-avatar";
import NavItem from "./nav-item";

export type NavItems = {
  label: string;
  icon: React.ElementType;
  href: string;
  isActive?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItems[];
};

const NAVIGATION_DATA: NavGroup[] = [
  {
    title: "",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        label: "AI Companion",
        icon: MessageSquare,
        href: "/ai-companion",
      },
      {
        label: "Journal & Reflections",
        icon: BookOpen,
        href: "/journals-reflections/archive",
      },
      {
        label: "Reframing & Insights",
        icon: Activity,
        href: "/reframing-insights",
      },
      {
        label: "Exercises & Protocols",
        icon: Dumbbell,
        href: "/exercises",
      },
    ],
  },
  {
    title: "Insights & Sessions",
    items: [
      {
        label: "Insights & Reports",
        icon: BarChart3,
        href: "/insights-reports",
      },
      {
        label: "Seek Professionals",
        icon: UserSearch,
        href: "/seek-professionals",
      },
      // {
      //   label: "History & Sessions",
      //   icon: History,
      //   href: "/history-sessions",
      // },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", icon: Settings, href: "/settings" },
      // { label: "Privacy & Security", icon: ShieldCheck, href: "/privacy" },
      { label: "Help & Support", icon: HelpCircle, href: "/help-support" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentUser = await getMe();
        if (isMounted) {
          setProfile(currentUser);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();

    const handleProfileUpdated = () => {
      void loadProfile();
    };

    window.addEventListener("alagamind:profile-updated", handleProfileUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(
        "alagamind:profile-updated",
        handleProfileUpdated,
      );
    };
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!footerRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [profileMenuOpen]);

  const navigation = useMemo(
    () =>
      NAVIGATION_DATA.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          isActive:
            item.href !== "#" &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`)),
        })),
      })),
    [pathname],
  );

  const profileName = profile
    ? `${profile.firstname} ${profile.lastname}`.trim()
    : "Session";
  const profileSubtitle = profile?.email ?? "Authenticated user";
  const initials = getInitials(profile);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setProfileMenuOpen(false);
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]  border-slate-200 dark:border-white/5 dark:bg-[radial-gradient(circle_at_top_left,#17324d_0%,#0f172a_24%,#020617_100%)]">
      <div className="p-6 pb-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg  dark:bg-transparent">
            <img
              src="/alagamind_logo.png"
              alt="AlagaMind Icon"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            AlagaMind
          </span>
        </div>
      </div>
      <div className="border-b border-slate-200 dark:border-white/5 px-6"></div>

      <div className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-4 py-3 ">
        <nav className="flex flex-col gap-8">
          {navigation.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavItem key={item.label} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div
        ref={footerRef}
        className="relative mt-auto border-t border-slate-200 dark:border-white/5 bg-transparent p-4"
      >
        {profileMenuOpen ? (
          <div className="absolute bottom-full left-4 right-4 mb-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3 shadow-xl shadow-slate-200/70 dark:shadow-black/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Active Session
            </p>
            <div className="mt-3 rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {profileName}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {profileSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-3 py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70"
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
        ) : null}

        <button
          type="button"
          onClick={() => setProfileMenuOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            {isProfileLoading ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-transparent bg-slate-900 dark:bg-teal-600 text-sm font-semibold text-white">
                <LoaderCircle className="h-4 w-4 animate-spin text-slate-300 dark:text-slate-500" />
              </div>
            ) : (
              <ProfileAvatar
                src={profile?.profileImageUrl}
                alt={`${profileName} profile picture`}
                initials={initials}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
                {isProfileLoading ? "Loading..." : profileName}
              </span>
              <span className="max-w-[120px] w-full truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {isProfileLoading ? "Checking session" : profileSubtitle}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
        </button>
      </div>
    </aside>
  );
}

function getInitials(profile: SessionUser | null) {
  const first = profile?.firstname?.trim().charAt(0) ?? "";
  const last = profile?.lastname?.trim().charAt(0) ?? "";
  const combined = `${first}${last}`.trim();

  return combined || "AM";
}
