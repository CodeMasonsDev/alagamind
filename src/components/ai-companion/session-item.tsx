"use client";

import { MessageSquare, Trash2, Clock, Hash } from "lucide-react";
import { UserSession } from "@/types/ai-companion";

/** Derive a readable label from session history or fall back to a default. */
function getSessionLabel(session: UserSession): string {
  if (session.history.length > 0) {
    const firstMsg = session.history[0].user;
    return firstMsg.length > 40 ? firstMsg.slice(0, 40) + "…" : firstMsg;
  }
  return "New conversation";
}

/** Get a short preview from the latest AI reply. */
function getPreview(session: UserSession): string {
  if (session.history.length === 0) return "No messages yet";
  const lastTurn = session.history[session.history.length - 1];
  const text = lastTurn.ai;
  return text.length > 60 ? text.slice(0, 60) + "…" : text;
}

/** Format a date string to a relative short label. */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: UserSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const label = getSessionLabel(session);
  const preview = getPreview(session);
  const timeLabel = formatRelativeTime(session.updated_at);

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onSelect(session.session_id)}
        className={`flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-all duration-200
          ${
            isActive
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
      >
        {/* Title row */}
        <div className="flex items-center gap-2">
          <MessageSquare
            size={14}
            className={`shrink-0 ${isActive ? "text-teal-400" : "text-slate-400"}`}
          />
          <span className="flex-1 truncate text-sm font-medium">{label}</span>
        </div>

        {/* Preview snippet */}
        <p
          className={`truncate pl-[22px] text-xs ${
            isActive ? "text-slate-300" : "text-slate-400"
          }`}
        >
          {preview}
        </p>

        {/* Meta row: turn count & timestamp */}
        <div
          className={`flex items-center gap-3 pl-[22px] text-[10px] font-medium ${
            isActive ? "text-slate-400" : "text-slate-400"
          }`}
        >
          <span className="inline-flex items-center gap-0.5">
            <Hash size={10} />
            {session.turn_count} {session.turn_count === 1 ? "turn" : "turns"}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Clock size={10} />
            {timeLabel}
          </span>
        </div>
      </button>

      {/* Delete button — visible on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.session_id);
        }}
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100
          ${
            isActive
              ? "text-slate-300 hover:bg-white/10 hover:text-red-300"
              : "text-slate-400 hover:bg-red-50 hover:text-red-500"
          }`}
        title="Delete conversation"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}
