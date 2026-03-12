"use client";
import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Activity,
  Dumbbell,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  HelpCircle,
  ChevronsUpDown,
  Command,
} from "lucide-react";
import NavItem from "./nav-item";

// --- Types ---
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

// --- Navigation Configuration ---
const NAVIGATION_DATA: NavGroup[] = [
  {
    title: "Wellness Intelligence",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        isActive: true,
      },
      {
        label: "AI Companion",
        icon: MessageSquare,
        href: "/ai-companion",
        isActive: false,
      },
      {
        label: "Journal & Reflections",
        icon: BookOpen,
        href: "/journals-reflections",
        isActive: false,
      },
      {
        label: "Mood & Trends",
        icon: Activity,
        href: "/mood-trends",
        isActive: false,
      },
      {
        label: "Exercises & Protocols",
        icon: Dumbbell,
        href: "/exercises",
        isActive: false,
      },
    ],
  },
  {
    title: "Insights & Sessions",
    items: [
      { label: "Insights & Reports", icon: BarChart3, href: "#" },
      { label: "History & Sessions", icon: History, href: "#" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", icon: Settings, href: "/settings" },
      { label: "Privacy & Security", icon: ShieldCheck, href: "/privacy" },
      { label: "Help & Support", icon: HelpCircle, href: "/help-support" },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-60 h-screen bg-slate-50 border-r border-slate-200">
      {/* Header & Status */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-teal-400">
            <Command size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            AlagaMind
          </span>
        </div>

        {/* Neural Engine Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-teal-50/80 border border-teal-100 rounded-full w-max">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
            Neural Engine Active
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 custom-scrollbar">
        <nav className="flex flex-col gap-8">
          {NAVIGATION_DATA.map((group, index) => (
            <div key={index}>
              <h3 className="px-3 mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
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

      <div className="p-4 mt-auto border-t border-slate-200 bg-white">
        <button className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?u=maya"
              alt="Maya Anderson"
              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
            />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-900">
                Maya Anderson
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Senior Analyst
              </span>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </aside>
  );
}
