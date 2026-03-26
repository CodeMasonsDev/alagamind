"use client";

import { Plus, X, MessageSquareText, RefreshCw } from "lucide-react";
import { UserSession } from "@/types/ai-companion";
import SessionItem from "./session-item";

export default function SessionSidebar({
  sessions,
  activeSessionId,
  isOpen,
  isCreating,
  isLoading,
  error,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClose,
  onRetry,
}: {
  sessions: UserSession[];
  activeSessionId: string;
  isOpen: boolean;
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <>
      {/* Sidebar panel — collapses in place via width */}
      <aside
        className={`relative flex h-full flex-col overflow-hidden bg-white/95 backdrop-blur-lg transition-all duration-300 ease-in-out
          ${isOpen ? "w-72 min-w-[18rem] border-r border-slate-200" : "w-0 min-w-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <MessageSquareText size={18} className="text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Conversations
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={onNewSession}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            {isCreating ? "Creating…" : "New Conversation"}
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {isLoading ? (
            /* Loading skeleton */
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-slate-100 px-3 py-4"
                >
                  <div className="mb-2 h-3 w-3/4 rounded bg-slate-200" />
                  <div className="h-2 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-xs font-medium text-red-400">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-slate-800"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <MessageSquareText size={28} className="text-slate-300" />
              <p className="text-xs font-medium text-slate-400">
                No conversations yet
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {sessions.map((session) => (
                <SessionItem
                  key={session.session_id}
                  session={session}
                  isActive={session.session_id === activeSessionId}
                  onSelect={onSelectSession}
                  onDelete={onDeleteSession}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </aside>
    </>
  );
}
