"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Trash2, Clock } from "lucide-react";
import type { ClientData } from "../api/mhp";

const STATUS_BADGE: Record<string, string> = {
  "New Request":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  "In Session":
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  "Follow-up":
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
};

interface ClientCardProps {
  client: ClientData;
  status: string;
  onDelete: (id: string, userId: string) => void;
  isDeleting: boolean;
  delay?: number;
}

function deriveStatusIcon(status: string) {
  switch (status) {
    case "New Request":
      return "🆕";
    case "In Session":
      return "🔵";
    case "Follow-up":
      return "📋";
    default:
      return "•";
  }
}

export function ClientCard({
  client,
  status,
  onDelete,
  isDeleting,
  delay = 0,
}: ClientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.45 + delay * 0.08,
        ease: "easeOut",
      }}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between px-6 py-5">
        {/* Left: Client Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* Client Name - Primary */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {client.email}
            </h3>

            {/* Status Badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + delay * 0.08, duration: 0.3 }}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[status]}`}
            >
              <span>{deriveStatusIcon(status)}</span>
              {status}
            </motion.span>
          </div>

          {/* Message - Secondary */}
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400">
            {client.message || "No additional notes"}
          </p>

          {/* User ID - Tertiary */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>
              User ID:{" "}
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {client.userId.slice(0, 8)}...
              </span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="ml-4 flex shrink-0 items-center gap-2">
          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onDelete(client.id, client.userId)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-200 hover:bg-rose-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10"
            title="Delete client"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>

          {/* Preview Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`/mentalhealth-professionals/${client.userId}?data=${encodeURIComponent(JSON.stringify(client))}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30"
            >
              Preview
              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
