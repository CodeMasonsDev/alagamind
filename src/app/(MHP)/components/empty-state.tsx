"use client";

import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";

interface EmptyStateProps {
  searchActive?: boolean;
}

export function EmptyState({ searchActive = false }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        {searchActive ? (
          <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        ) : (
          <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        {searchActive ? "No pending requests found" : "All caught up! 🎉"}
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {searchActive
          ? "Try adjusting your search criteria to find pending client requests."
          : "You have no pending client requests at the moment. Check back soon or review your active sessions."}
      </p>
    </motion.div>
  );
}
