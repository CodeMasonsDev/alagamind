"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const THEME_OPTIONS = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
] as const;

export default function ThemePreferenceSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-[272px] rounded-full bg-slate-100 dark:bg-slate-800" />;
  }

  const activeIndex = THEME_OPTIONS.findIndex((o) => o.id === theme);

  return (
    <div className="relative inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/50 p-1 shadow-inner">
      {/* Sliding pill indicator */}
      <span
        className="pointer-events-none absolute left-1 top-1 h-[calc(100%-8px)] rounded-full bg-white dark:bg-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: `calc((100% - 8px) / ${THEME_OPTIONS.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {THEME_OPTIONS.map(({ id, label, Icon }) => {
        const isActive = theme === id;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} theme`}
            onClick={() => setTheme(id as string)}
            className={`
              relative z-10 flex items-center gap-1.5 rounded-full px-4 py-2
              text-[13px] font-semibold transition-colors duration-200
              ${
                isActive
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }
            `}
          >
            <Icon
              className={`h-3.5 w-3.5 transition-colors duration-200 ${
                isActive ? "text-teal-600 dark:text-teal-400" : ""
              }`}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
