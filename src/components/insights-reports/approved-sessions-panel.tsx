"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, LoaderCircle, X, Video, User, Clock, FileText, Calendar, AlertCircle, ChevronDown } from "lucide-react";
import { getSessionsByClient, getSessionById, getUserProfileById, type MHPSessionListItem, type MHPSessionDetail, type UserProfile } from "@/app/(MHP)/api/mhp";

function formatDateTime(dateIso: string, time: string) {
  const date = new Date(dateIso);
  const dateLabel = Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : dateIso;

  return `${dateLabel} · ${time}`;
}

function sessionSettingLabel(setting: string) {
  const normalized = (setting || "").toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("inperson")) return "In-person";
  if (normalized.includes("session")) return "Online";
  return setting || "Session";
}

function sessionTypeTone(type: string) {
  const normalized = (type || "").toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("follow")) return "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300";
  if (normalized.includes("crisis")) return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
  if (normalized.includes("evaluation")) return "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300";
  if (normalized.includes("discharge")) return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  return "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300";
}

type ApprovedSessionsPanelProps = {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  hideClose?: boolean;
};

export default function ApprovedSessionsPanel({
  clientId,
  isOpen,
  onClose,
  hideClose = false,
}: ApprovedSessionsPanelProps) {
  const [sessions, setSessions] = useState<MHPSessionDetail[]>([]);
  const [mhpProfiles, setMhpProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (!clientId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const listData = await getSessionsByClient(clientId);
        if (!isMounted) return;

        // Fetch full session details for each session to get complete data
        const detailedSessions: MHPSessionDetail[] = [];
        for (const session of listData) {
          try {
            const detailed = await getSessionById(session.id);
            detailedSessions.push(detailed);
          } catch (err) {
            console.error(`Failed to load session details for ${session.id}:`, err);
            // Fallback to list item data if detail fetch fails
            detailedSessions.push(session as any);
          }
        }

        if (!isMounted) return;
        setSessions(detailedSessions);

        const uniqueMhpIds = [...new Set(detailedSessions.map((s) => s.mhpId))];
        const profiles: Record<string, UserProfile> = {};

        for (const mhpId of uniqueMhpIds) {
          try {
            const profile = await getUserProfileById(mhpId);
            if (isMounted) {
              profiles[mhpId] = profile;
            }
          } catch (err) {
            console.error(`Failed to load MHP profile for ${mhpId}:`, err);
          }
        }

        if (isMounted) {
          setMhpProfiles(profiles);
        }
      } catch (e) {
        if (!isMounted) return;
        setSessions([]);
        setError(e instanceof Error ? e.message : "Failed to load sessions.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [clientId, isOpen]);

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const at = new Date(a.sessionDate).getTime();
      const bt = new Date(b.sessionDate).getTime();
      return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
    });
  }, [sessions]);

  if (!isOpen) return null;

  return (
    <section className="rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3 mb-4 sm:mb-5 px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-500/15 px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Active Sessions
            </span>
          </div>
          <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Your Appointments
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Track and manage your scheduled sessions with professionals.
          </p>
        </div>
        {!hideClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
            aria-label="Close approved sessions"
          >
            <X className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
        )}
      </div>

      <div className="px-3 sm:px-4 py-3 sm:py-4">
        {isLoading ? (
          <div className="flex items-center justify-center px-4 py-8">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle className="h-5 w-5 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading your sessions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-400" />
              {error}
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center dark:border-white/10">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No approved sessions yet. Request a professional to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-screen">
            {sorted.map((session) => {
              const when = formatDateTime(session.sessionDate, session.sessionTime);
              const settingLabel = sessionSettingLabel(session.sessionSetting);
              const mhpProfile = mhpProfiles[session.mhpId];
              const mhpName = mhpProfile
                ? `${mhpProfile.firstname} ${mhpProfile.lastname}`.trim()
                : "Mental Health Professional";
              const mhpEmail = mhpProfile?.email || "N/A";
              const expanded = expandedSessions[session.id] ?? false;
              const toggleExpanded = () => {
                setExpandedSessions((prev) => ({
                  ...prev,
                  [session.id]: !prev[session.id],
                }));
              };

              return (
                <div
                  key={session.id}
                  className="group rounded-lg sm:rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 transition-all hover:border-teal-300 hover:shadow-md dark:border-white/10 dark:from-slate-800/50 dark:to-slate-900/30 dark:hover:border-teal-500/40 dark:hover:shadow-lg dark:hover:shadow-teal-500/10"
                >
                  {/* Header: Collapsed View */}
                  <button
                    onClick={toggleExpanded}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-left hover:bg-slate-50/50 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {session.sessionType} Session
                          </h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {when}
                          </p>
                          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                            {mhpName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${sessionTypeTone(
                            session.sessionType,
                          )}`}
                        >
                          {session.sessionType}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expanded && (
                    <div className="border-t border-slate-200 dark:border-white/10 px-3 sm:px-4 py-3 sm:py-4 space-y-3">
                      {/* MHP Details */}
                      <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {mhpName}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {mhpEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Google Meet Link & Duration - Row */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {session.googleMeetLink ? (
                          <a
                            href={session.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-500/15 px-4 py-2.5 text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                          >
                            <Video className="h-5 w-5 shrink-0" />
                            Join Google Meet
                          </a>
                        ) : (
                          <div className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/15 px-4 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-400">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            No Meet Link Provided
                          </div>
                        )}
                        {session.duration && (
                          <div className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-slate-100 dark:bg-white/10 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Clock className="h-5 w-5 shrink-0" />
                            {session.duration} minutes
                          </div>
                        )}
                      </div>

                      {/* Topics Covered */}
                      {session.topicsCovered && (
                        <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Topics Covered
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                {session.topicsCovered}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Therapist Notes */}
                      {session.therapistNotes && (
                        <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Therapist Notes
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                {session.therapistNotes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Scheduled Session */}
                      {session.nextScheduledSession && (
                        <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-4">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Next Session Scheduled
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {new Date(session.nextScheduledSession).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Session Details Footer */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
                        <span className="inline-flex items-center gap-2 rounded-md bg-emerald-100/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          {settingLabel}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-white/10 dark:text-slate-300">
                          <CalendarDays className="h-4 w-4" />
                          Approved: {new Date(session.dateCreated).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {session.attendance && (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-white/10 dark:text-slate-300">
                            {session.attendance}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

