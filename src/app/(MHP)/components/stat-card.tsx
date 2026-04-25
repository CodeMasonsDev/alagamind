"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: "teal" | "violet" | "amber" | "rose";
  delay?: number;
}

const colorMap = {
  teal: {
    icon: "text-teal-600 dark:text-teal-400",
  },
  violet: {
    icon: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    icon: "text-rose-600 dark:text-rose-400",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay = 0,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + delay * 0.15, ease: "easeOut" }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800">
          <Icon className={`h-6 w-6 ${colors.icon}`} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}
