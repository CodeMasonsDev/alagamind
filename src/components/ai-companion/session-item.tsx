"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import { SessionListItem } from "@/types/ai-companion";

export default function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: SessionListItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onSelect(session.id)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200
          ${
            isActive
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
      >
        <MessageSquare
          size={16}
          className={`shrink-0 ${isActive ? "text-teal-400" : "text-slate-400"}`}
        />
        <span className="flex-1 truncate font-medium">{session.label}</span>
      </button>

      {/* Delete button — visible on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
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
