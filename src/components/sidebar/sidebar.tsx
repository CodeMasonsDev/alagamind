"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronsUpDown,
  Command,
  Dumbbell,
  HelpCircle,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageSquare,
  Settings,
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
    <aside className="flex h-screen w-60 flex-col border-r bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_25%)]">
      <div className="p-6 pb-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-teal-400">
            <Command size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            AlagaMind
          </span>
        </div>
      </div>
      <div className="border-b-1 border-gray-300"></div>

      <div className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-4 py-3 ">
        <nav className="flex flex-col gap-8">
          {navigation.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
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
        className="relative mt-auto border-t border-slate-200 bg-white p-4"
      >
        {profileMenuOpen ? (
          <div className="absolute bottom-full left-4 right-4 mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Active Session
            </p>
            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-900">
                {profileName}
              </p>
              <p className="mt-1 text-xs text-slate-500">{profileSubtitle}</p>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
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
          className="flex w-full items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            {isProfileLoading ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-sm font-semibold text-white">
                <LoaderCircle className="h-4 w-4 animate-spin text-slate-300" />
              </div>
            ) : (
              <ProfileAvatar
                src={profile?.profileImageUrl}
                alt={`${profileName} profile picture`}
                initials={initials}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-900">
                {isProfileLoading ? "Loading profile..." : profileName}
              </span>
              <span className="max-w-[120px] truncate text-xs font-medium text-slate-500">
                {isProfileLoading ? "Checking session" : profileSubtitle}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
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
