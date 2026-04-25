"use client";

import { useEffect, useMemo, useState } from "react";
import { getMe } from "@/api/auth/auth";
import {
  getSessionsByMHP,
  getSessionById,
  deleteSession,
  updateSession,
  getUserProfileById,
  type UserProfile,
  type MHPSessionListItem,
  type MHPSessionDetail,
  type UpdateSessionPayload,
} from "@/app/(MHP)/api/mhp";
import {
  LoaderCircle,
  X,
  Search,
  Trash2,
  Link2,
} from "lucide-react";

export default function SessionRegistryPage() {
  const [sessions, setSessions] = useState<MHPSessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "All" | "Idle" | "Follow-up" | "Evaluation" | "Crisis" | "Discharge"
  >("All");

  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {},
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sessionDetail, setSessionDetail] = useState<MHPSessionDetail | null>(
    null,
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editForm, setEditForm] = useState<UpdateSessionPayload | null>(null);
  const [editTopics, setEditTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const mhp = await getMe();
        if (mhp?.id) {
          const data = await getSessionsByMHP(mhp.id);
          setSessions(data);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    const uniqueUserIds = Array.from(new Set(sessions.map((s) => s.userId)));
    const missingUserIds = uniqueUserIds.filter((id) => !userProfiles[id]);
    if (missingUserIds.length === 0) return;

    let cancelled = false;
    const loadProfiles = async () => {
      try {
        const results = await Promise.all(
          missingUserIds.map(async (id) => {
            try {
              const profile = await getUserProfileById(id);
              return { id, profile } as const;
            } catch {
              return { id, profile: null } as const;
            }
          }),
        );

        if (cancelled) return;
        setUserProfiles((prev) => {
          const next = { ...prev };
          for (const r of results) {
            if (r.profile) next[r.id] = r.profile;
          }
          return next;
        });
      } catch (error) {
        console.error("Error loading user profiles:", error);
      }
    };

    void loadProfiles();
    return () => {
      cancelled = true;
    };
  }, [sessions, userProfiles]);

  const getClientName = useMemo(() => {
    const toTitleCase = (value: string) =>
      value
        .split(" ")
        .filter(Boolean)
        .map((word) =>
          word.length > 0
            ? `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`
            : "",
        )
        .join(" ");

    return (userId: string) => {
      const profile = userProfiles[userId];
      if (!profile) return "Loading...";
      const first = profile.firstname?.trim();
      const last = profile.lastname?.trim();
      const rawName = [first, last].filter(Boolean).join(" ").trim();
      const name = rawName ? toTitleCase(rawName) : "";
      return name || profile.email || userId;
    };
  }, [userProfiles]);

  const filteredSessions = sessions.filter((session) => {
    const matchesType =
      filterType === "All" || session.sessionType === filterType;
    const matchesSearch =
      searchQuery === "" ||
      getClientName(session.userId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      session.sessionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.sessionSetting.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSessionClick = async (id: number) => {
    setSelectedId(id);
    setIsDetailLoading(true);
    try {
      const detail = await getSessionById(id);

      const normalizeSessionType = (value: string) => {
        const trimmed = value?.trim();
        if (!trimmed) return "Idle";
        const allowed = new Set([
          "Idle",
          "Follow-up",
          "Evaluation",
          "Crisis",
          "Discharge",
        ]);
        if (allowed.has(trimmed)) return trimmed;
        // Legacy values (e.g. "Initial", "Intake") map to the new default.
        return "Idle";
      };

      setSessionDetail(detail);
      setIsEditing(false);
      const topics = parseTopicsCovered(detail.topicsCovered);
      setEditTopics(topics);
      setEditForm({
        userId: detail.userId,
        mhpId: detail.mhpId,
        sessionType: normalizeSessionType(detail.sessionType),
        sessionSetting: detail.sessionSetting,
        googleMeetLink: detail.googleMeetLink,
        sessionDate: detail.sessionDate,
        sessionTime: detail.sessionTime,
        duration: detail.duration,
        attendance: detail.attendance,
        progress: detail.progress,
        topicsCovered: detail.topicsCovered,
        therapistNotes: detail.therapistNotes,
        nextScheduledSession: detail.nextScheduledSession ?? null,
      });
    } catch (error) {
      console.error("Error loading session detail:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedId(null);
    setSessionDetail(null);
    setIsEditing(false);
    setEditForm(null);
    setEditTopics([]);
    setTopicInput("");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleAddTopic = () => {
    if (topicInput.trim() && !editTopics.includes(topicInput.trim())) {
      const newTopics = [...editTopics, topicInput.trim()];
      setEditTopics(newTopics);
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setEditTopics(editTopics.filter((t) => t !== topic));
  };

  const handleSaveSession = async () => {
    if (!editForm || selectedId === null) return;
    setIsSaving(true);
    try {
      const topicsStr = JSON.stringify(editTopics);
      await updateSession(selectedId, {
        ...editForm,
        topicsCovered: topicsStr,
      });
      const updated = await getSessionById(selectedId);
      setSessionDetail(updated);
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, ...updated } : s)),
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    if (selectedId === null) return;
    if (!confirm("Delete this session? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteSession(selectedId);
      setSessions((prev) => prev.filter((s) => s.id !== selectedId));
      handleCloseModal();
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const parseTopicsCovered = (topicsStr: string): string[] => {
    try {
      return JSON.parse(topicsStr);
    } catch {
      return [];
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${timeStr}`;
  };

  const getSessionTypeColor = (type: string) => {
    if (type === "Follow-up")
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    if (type === "Evaluation")
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (type === "Crisis")
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
    if (type === "Discharge")
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
  };

  const getAttendanceDot = (attendance: string) => {
    if (attendance === "Attended")
      return <div className="h-2 w-2 rounded-full bg-emerald-500" />;
    if (attendance === "Absent")
      return <div className="h-2 w-2 rounded-full bg-rose-500" />;
    return <div className="h-2 w-2 rounded-full bg-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-100">
            Session History
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Track and review all therapy sessions with clients.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2">
            {(
              ["All", "Idle", "Follow-up", "Evaluation", "Crisis", "Discharge"] as const
            ).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filterType === filter
                    ? "bg-teal-600 text-white dark:bg-teal-500"
                    : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {filter === "All"
                  ? "All Sessions"
                  : filter === "Crisis"
                    ? "Crises"
                    : filter === "Discharge"
                      ? "Discharges"
                      : filter === "Idle"
                        ? "Idle"
                        : filter + "s"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-slate-600 dark:text-slate-400">
                Loading sessions...
              </p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-400">
              No sessions found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden rounded-2xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400 lg:grid lg:grid-cols-[140px_minmax(180px,1fr)_120px_120px_minmax(160px,1fr)_140px_200px] lg:items-center">
              <div>Date</div>
              <div>Name</div>
              <div>Type</div>
              <div>Duration</div>
              <div>Topics</div>
              <div>Attendance</div>
              <div>Progress</div>
            </div>

            {filteredSessions.map((session) => {
              const topics =
                typeof (session as { topicsCovered?: unknown }).topicsCovered ===
                "string"
                  ? parseTopicsCovered(
                      (session as { topicsCovered?: string }).topicsCovered ??
                        "[]",
                    )
                  : [];

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSessionClick(session.id)}
                  className="w-full rounded-2xl bg-white px-6 py-5 text-left shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-teal-400/30 dark:bg-slate-900 dark:shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="grid gap-4 lg:grid-cols-[140px_minmax(180px,1fr)_120px_120px_minmax(160px,1fr)_140px_200px] lg:items-center">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:hidden">
                        Date
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100 lg:mt-0">
                        {formatDate(session.sessionDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:hidden">
                        Name
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 lg:mt-0">
                        <span className="line-clamp-1">
                          {getClientName(session.userId)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:hidden">
                        Type
                      </div>
                      <div className="mt-1 lg:mt-0">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getSessionTypeColor(
                            session.sessionType,
                          )}`}
                        >
                          {session.sessionType}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:hidden">
                        Duration
                      </div>
                      <div className="mt-1 text-sm text-slate-700 dark:text-slate-300 lg:mt-0">
                        {session.sessionTime}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:hidden">
                        Topics
                      </div>
                      <div className="mt-1 text-sm text-slate-700 dark:text-slate-300 lg:mt-0">
                        <span className="line-clamp-1">
                          {topics.length ? topics.slice(0, 2).join(", ") : "—"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:hidden">
                        Attendance
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 lg:mt-0">
                        {getAttendanceDot(session.attendance)}
                        <span>{session.attendance || "—"}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 lg:hidden">
                        Progress
                      </div>
                      <div className="mt-2 flex items-center gap-3 lg:mt-0">
                        <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-2 rounded-full bg-teal-500"
                            style={{ width: `${session.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {session.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]" />

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] dark:bg-slate-900 dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
            {isDetailLoading ? (
              <div className="flex min-h-96 items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : !isEditing && sessionDetail ? (
              <ViewMode
                detail={sessionDetail}
                onEdit={handleEditClick}
                onDelete={handleDeleteSession}
                onClose={handleCloseModal}
                isDeleting={isDeleting}
                clientName={getClientName(sessionDetail.userId)}
                parseTopics={parseTopicsCovered}
                formatDateTime={formatDateTime}
              />
            ) : isEditing && editForm ? (
              <EditMode
                form={editForm}
                topics={editTopics}
                topicInput={topicInput}
                onFormChange={setEditForm}
                onTopicInputChange={setTopicInput}
                onAddTopic={handleAddTopic}
                onRemoveTopic={handleRemoveTopic}
                onSave={handleSaveSession}
                onCancel={() => setIsEditing(false)}
                isSaving={isSaving}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function ViewMode({
  detail,
  onEdit,
  onDelete,
  onClose,
  isDeleting,
  clientName,
  parseTopics,
  formatDateTime,
}: {
  detail: MHPSessionDetail;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isDeleting: boolean;
  clientName: string;
  parseTopics: (str: string) => string[];
  formatDateTime: (date: string, time: string) => string;
}) {
  const topics = parseTopics(detail.topicsCovered);
  const progress = Number.isFinite(Number(detail.progress))
    ? Number(detail.progress)
    : 0;
  const hasMeetLink = (detail.googleMeetLink || "").trim().length > 0;
  const nextScheduled = detail.nextScheduledSession
    ? new Date(detail.nextScheduledSession).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not scheduled";

  return (
    <>
      <div className="px-8 pb-5 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
              {detail.sessionType} Session
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              {clientName}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {formatDateTime(detail.sessionDate, detail.sessionTime)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              disabled={isDeleting}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
              title="Delete session"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-7 px-8 pb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Duration
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              {detail.duration} min
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Attendance
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              {detail.attendance}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Session Setting
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              {detail.sessionSetting || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Google Meet Link
            </p>
            {hasMeetLink ? (
              <a
                href={detail.googleMeetLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex max-w-full items-center gap-2 truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                title={detail.googleMeetLink}
              >
                <Link2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="truncate">{detail.googleMeetLink}</span>
              </a>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                None
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Topics Covered
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.length === 0 ? (
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No topics recorded.
              </span>
            ) : null}
            {topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Progress Toward Goals
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-2 rounded-full bg-teal-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {progress}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Therapist Notes
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {detail.therapistNotes?.trim().length ? detail.therapistNotes : "No notes."}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-5 py-4 dark:bg-slate-800/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Next Scheduled Session
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {nextScheduled}
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-white/5 dark:text-slate-400 sm:grid-cols-2">
          <div>
            <span className="font-semibold uppercase tracking-wide">Created</span>{" "}
            <span className="ml-1">
              {new Date(detail.dateCreated).toLocaleString("en-US")}
            </span>
          </div>
          <div className="sm:text-right">
            <span className="font-semibold uppercase tracking-wide">Updated</span>{" "}
            <span className="ml-1">
              {new Date(detail.dateUpdated).toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function EditMode({
  form,
  topics,
  topicInput,
  onFormChange,
  onTopicInputChange,
  onAddTopic,
  onRemoveTopic,
  onSave,
  onCancel,
  isSaving,
}: {
  form: UpdateSessionPayload;
  topics: string[];
  topicInput: string;
  onFormChange: (f: UpdateSessionPayload) => void;
  onTopicInputChange: (s: string) => void;
  onAddTopic: () => void;
  onRemoveTopic: (t: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const handleDateChange = (newDate: string) => {
    if (!newDate) {
      onFormChange({ ...form, nextScheduledSession: null });
      return;
    }
    const date = new Date(newDate);
    const isoString = date.toISOString();
    onFormChange({ ...form, nextScheduledSession: isoString });
  };

  const dateInputValue = form.nextScheduledSession
    ? new Date(form.nextScheduledSession).toISOString().split("T")[0]
    : "";

  return (
    <>
      <div className="px-8 pb-5 pt-8">
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
          Edit Session
        </h2>
      </div>

      <div className="space-y-6 px-8 pb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Session Type
            </label>
            <select
              value={form.sessionType}
              onChange={(e) =>
                onFormChange({ ...form, sessionType: e.target.value })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              <option>Idle</option>
              <option>Follow-up</option>
              <option>Evaluation</option>
              <option>Crisis</option>
              <option>Discharge</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Duration (min)
            </label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  duration: parseInt(e.target.value) || 0,
                })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Google Meet Link
            </label>
            <div className="relative mt-2">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={form.googleMeetLink ?? ""}
                onChange={(e) =>
                  onFormChange({ ...form, googleMeetLink: e.target.value })
                }
                placeholder="https://meet.google.com/..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Optional for in-person sessions.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Attendance
          </label>
          <div className="mt-3 space-y-2">
            {["Attended", "Absent", "Rescheduled"].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="attendance"
                  value={option}
                  checked={form.attendance === option}
                  onChange={(e) =>
                    onFormChange({ ...form, attendance: e.target.value })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Progress Toward Goals ({form.progress}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={form.progress}
            onChange={(e) =>
              onFormChange({
                ...form,
                progress: parseInt(e.target.value),
              })
            }
            className="mt-3 w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Topics Covered
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => onTopicInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddTopic();
                }
              }}
              placeholder="Add a topic..."
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            />
            <button
              onClick={onAddTopic}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              + Add
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
              >
                {topic}
                <button
                  onClick={() => onRemoveTopic(topic)}
                  className="hover:text-teal-900 dark:hover:text-teal-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Therapist Notes
          </label>
          <textarea
            value={form.therapistNotes}
            onChange={(e) =>
              onFormChange({ ...form, therapistNotes: e.target.value })
            }
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            placeholder="Enter notes from this session..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Next Scheduled Session
          </label>
          <input
            type="date"
            value={dateInputValue}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
