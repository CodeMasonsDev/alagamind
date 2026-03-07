"use client";

import Link from "next/link";
import { NavItems } from "./sidebar";
import { usePathname } from "next/navigation";

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
            ? "bg-white text-slate-900 shadow-sm border border-slate-100/50 ring-1 ring-slate-900/5"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          strokeWidth={isActive ? 2.5 : 2}
          className={`w-5 h-5 ${isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}
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
