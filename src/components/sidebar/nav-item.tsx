"use client";

import Link from "next/link";
import { NavItems } from "./sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function NavItem({ item }: { item: NavItems }) {
  const Icon = item.icon;
  const pathname = usePathname();

  const isActive =
    item.href !== "#" &&
    (pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <li className="relative group">
      {/* Active Indicator Line */}
      {isActive && (
        <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full" />
      )}

      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-white dark:bg-white/5 text-slate-900 dark:text-white shadow-sm dark:shadow-none border border-slate-100/50 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-0"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-white/5"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          strokeWidth={isActive ? 2.5 : 2}
          className={`w-5 h-5 ${isActive ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}
        />

        <span
          className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}
        >
          {item.label}
        </span>
      </Link>
    </li>
  );
}
