"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import { MakeJournal, updateJournal } from "@/services/journals";
import { useReflections } from "@/components/providers/reflections-provider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GetUserJournal } from "@/api/journal";
import { getMe, SessionUser } from "@/api/auth/auth";
import { generateJournalSegments } from "@/api/journal-segments";
import { analyzeJournalSentiment } from "@/api/journal-sentiment";
import {
  formatJournalCalendarDate,
  formatJournalClockTime,
  parseJournalTimestamp,
} from "@/lib/journal-datetime";
import EddyModal from "@/components/journals/eddy-modal";
import JournalPrompts from "@/components/journals/journal-prompts";

type QuillEditor = import("quill").default;
type JournalTimestampRecord = {
  createdAt?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
};

type JournalSaveRecord = JournalTimestampRecord & {
  id?: unknown;
  journalId?: unknown;
};

const JOURNAL_DETAIL_SESSION_CACHE_PREFIX = "journal-detail";
const JOURNAL_INSIGHTS_SESSION_CACHE_PREFIX = "journal-insights";

export default function ReflectionEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillEditor | null>(null);
  const router = useRouter();

  const [title, setTitle] = useState("Daily Equilibrium Check-in");
  const [isSaving, setIsSaving] = useState(false);
  const [journalId, setJournalId] = useState<string | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isHydratingUpdate, setIsHydratingUpdate] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [displayTimestampMs, setDisplayTimestampMs] = useState(() =>
    Date.now(),
  );
  const [baselineTitle, setBaselineTitle] = useState("");
  const [baselineEditorHtml, setBaselineEditorHtml] = useState("");
  const searchParams = useSearchParams();
  const requestedJournalId = searchParams.get("journalId")?.trim();
  const isUpdateMode = Boolean(requestedJournalId || journalId);
  const hasPendingChanges =
    !isUpdateMode ||
    normalizeTitleForCompare(title) !==
      normalizeTitleForCompare(baselineTitle) ||
    normalizeHtmlForCompare(editorHtml) !==
      normalizeHtmlForCompare(baselineEditorHtml);
  const isSaveDisabled =
    isSaving || isHydratingUpdate || (isUpdateMode && !hasPendingChanges);

  const [eddyAnchor, setEddyAnchor] = useState<{
    text: string;
    rect: DOMRect;
  } | null>(null);
  const [eddyModalOpen, setEddyModalOpen] = useState(false);
  const eddyModalOpenRef = useRef(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );
  const [mobileEddyOpen, setMobileEddyOpen] = useState(false);

  const { refreshEntries, addEntry } = useReflections();

  const [profile, setProfile] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const currentUser = await getMe();
        console.log("from dashboard", currentUser);

        if (isMounted) setProfile(currentUser);
      } catch {
        if (isMounted) setProfile(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const userId = profile?.id;

  useEffect(() => {
    eddyModalOpenRef.current = eddyModalOpen;
  }, [eddyModalOpen]);

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const selectPrompt = useCallback((prompt: string) => {
    setActivePrompt(prompt);
    setTimeout(() => quillRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!isEditorReady || !quillRef.current) return;

    const quill = quillRef.current;

    const handleSelectionChange = (
      range: { index: number; length: number } | null,
    ) => {
      if (eddyModalOpenRef.current) return;

      if (!range || range.length === 0) {
        setEddyAnchor(null);
        return;
      }

      const selectedText = quill.getText(range.index, range.length).trim();
      if (!selectedText) {
        setEddyAnchor(null);
        return;
      }

      const domSel = window.getSelection();
      if (!domSel || domSel.rangeCount === 0) {
        setEddyAnchor(null);
        return;
      }

      const rect = domSel.getRangeAt(0).getBoundingClientRect();
      setEddyAnchor({ text: selectedText, rect });
    };

    quill.on("selection-change", handleSelectionChange);
    return () => {
      quill.off("selection-change", handleSelectionChange);
    };
  }, [isEditorReady]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      editorRef.current &&
      !quillRef.current
    ) {
      import("quill").then((QuillModule) => {
        const Quill = QuillModule.default;
        quillRef.current = new Quill(editorRef.current!, {
          theme: "snow",
          modules: {
            toolbar: "#custom-toolbar",
          },
          placeholder: "Start Reflection...",
        });
        setIsEditorReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!isEditorReady || !quillRef.current) {
      return;
    }

    const quill = quillRef.current;

    const syncEditorHtml = () => {
      setEditorHtml(quill.root.innerHTML);
    };

    syncEditorHtml();
    quill.on("text-change", syncEditorHtml);

    return () => {
      quill.off("text-change", syncEditorHtml);
    };
  }, [isEditorReady]);

  useEffect(() => {
    if (!isEditorReady || !quillRef.current) {
      return;
    }

    if (!requestedJournalId || !userId) {
      setIsHydratingUpdate(false);
      return;
    }

    let isCancelled = false;
    setIsHydratingUpdate(true);

    const hydrateEditorForUpdate = async () => {
      try {
        const journal = await GetUserJournal(userId, requestedJournalId);
        if (!journal || isCancelled || !quillRef.current) return;

        const resolvedTitle =
          String(journal.title ?? "").trim() || "Untitled Reflection";
        const resolvedJournalId = String(
          journal.id ?? journal.journalId ?? requestedJournalId,
        );
        const sanitizedHtmlContent = sanitizeEditorHtml(
          String(journal.content ?? ""),
        );

        setTitle(resolvedTitle);
        setJournalId(resolvedJournalId);
        quillRef.current.setText("");
        if (sanitizedHtmlContent) {
          quillRef.current.clipboard.dangerouslyPasteHTML(sanitizedHtmlContent);
        }
        quillRef.current.history.clear();
        const hydratedHtml = quillRef.current.root.innerHTML;
        setEditorHtml(hydratedHtml);
        setBaselineEditorHtml(hydratedHtml);
        setBaselineTitle(resolvedTitle);
        setDisplayTimestampMs(resolveJournalTimestamp(journal) ?? Date.now());
      } catch (error) {
        console.error("Failed to load journal for update:", error);
      } finally {
        if (!isCancelled) {
          setIsHydratingUpdate(false);
        }
      }
    };

    hydrateEditorForUpdate();

    return () => {
      isCancelled = true;
    };
  }, [isEditorReady, requestedJournalId, userId]);

  useEffect(() => {
    if (!isEditorReady || requestedJournalId || !quillRef.current) {
      return;
    }

    setJournalId(null);
    setTitle("Daily Equilibrium Check-in");
    quillRef.current.setText("");
    quillRef.current.history.clear();
    const resetHtml = quillRef.current.root.innerHTML;
    setEditorHtml(resetHtml);
    setBaselineEditorHtml("");
    setBaselineTitle("");
    setDisplayTimestampMs(Date.now());
    setIsHydratingUpdate(false);
  }, [isEditorReady, requestedJournalId]);

  const handleSaveReflection = async () => {
    if (!quillRef.current || !userId) return;

    setIsSaving(true);

    try {
      const htmlContent = quillRef.current.root.innerHTML;
      const plainContent = stripHtml(htmlContent);
      const resolvedTitle = title.trim() || "Untitled Reflection";
      const submittedAtMs = Date.now();

      if (journalId) {
        const payload = {
          userId,
          journalId,
          title: resolvedTitle,
          content: htmlContent,
        };

        const updateRes = await updateJournal(payload);
        if (!updateRes) throw new Error("Update failed: Empty response");
        const updatedJournalId = resolveSavedJournalId(updateRes, journalId);
        setDisplayTimestampMs(
          resolveJournalTimestamp(updateRes) ?? submittedAtMs,
        );
        await syncJournalAnalysis({
          journalId: updatedJournalId,
          plainContent,
        });
        clearJournalSessionCache(userId, updatedJournalId);
        void refreshEntries();

        if (updatedJournalId) {
          router.push(
            `/journals-reflections/my-journal/${userId}/${updatedJournalId}?refresh=true`,
          );
          return;
        }

        const savedHtml = quillRef.current.root.innerHTML;
        setEditorHtml(savedHtml);
        setBaselineEditorHtml(savedHtml);
        setBaselineTitle(resolvedTitle);
      } else {
        const payload = {
          userId,
          title: resolvedTitle,
          content: htmlContent,
        };

        const data = await MakeJournal(payload);
        if (!data) throw new Error("Create failed: Empty response");
        setDisplayTimestampMs(resolveJournalTimestamp(data) ?? submittedAtMs);
        const newId = resolveSavedJournalId(data);
        await syncJournalAnalysis({
          journalId: newId,
          plainContent,
        });
        clearJournalSessionCache(userId, newId);
        void refreshEntries();

        addEntry({
          id: newId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: formatJournalCalendarDate(submittedAtMs),
          mood: "Neutral",
          title: resolvedTitle,
          preview:
            plainContent.length > 120
              ? `${plainContent.slice(0, 120).trimEnd()}...`
              : plainContent || "No content",
          tags: [],
          action: "View Reflection",
          wordCount: `${plainContent.split(/\s+/).filter(Boolean).length} words`,
          moodClass: "text-gray-700 bg-gray-50 ring-gray-600/20",
          dotClass: "bg-gray-500",
        });

        if (newId) {
          router.push(`/journals-reflections/my-journal/${userId}/${newId}`);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to save journal:", error);
      alert("Failed to save reflection. Check the console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcfaf5_0%,#f1f5f9_100%)] font-sans text-gray-900 dark:bg-[radial-gradient(circle_at_top_right,#1e293b_0%,#0f172a_36%,#020617_100%)] dark:text-slate-100">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-amber-100/70 bg-white/85 px-8 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center space-x-6 text-sm font-medium text-gray-500 dark:text-slate-400">
          <Link
            href="/journals-reflections/archive"
            className="flex items-center transition-colors hover:text-gray-900 dark:hover:text-slate-100"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>

        <div className="flex items-center space-x-3 text-sm font-medium">
          <button
            onClick={() => setShowPrompts(true)}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-teal-700/50 dark:hover:bg-teal-950/30 dark:hover:text-teal-300 sm:flex"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Prompts
          </button>
          <button
            onClick={handleSaveReflection}
            disabled={isSaveDisabled}
            className="mx-2 flex items-center rounded-md bg-teal-600 px-4 py-1.5 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                {isUpdateMode ? "Update Reflection" : "Save Reflection"}
              </>
            )}
          </button>
        </div>
      </header>
      <main className="mx-auto   px-4 py-8 pb-24 sm:px-8 sm:py-12 sm:pb-12">
        <section className="rounded-3xl border max-h-screen border-amber-100 bg-white/90 p-6 shadow-[0_12px_45px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900/85">
          <div className="mb-10">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-6  w-full border-none bg-transparent font-serif text-4xl font-bold tracking-tight text-slate-900 outline-none placeholder-slate-300 focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-600"
              placeholder="Entry Title..."
            />

            <div className="grid grid-cols-[120px_1fr] gap-y-4 text-sm">
              <div className="flex items-center text-gray-400 dark:text-slate-500">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Date
              </div>
              <div className="font-medium text-gray-700 dark:text-slate-200">
                {formatJournalCalendarDate(displayTimestampMs)}
              </div>

              <div className="flex items-center text-gray-400 dark:text-slate-500">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Time
              </div>
              <div className="font-medium text-gray-700 dark:text-slate-200">
                {formatJournalClockTime(displayTimestampMs)}
              </div>
            </div>
          </div>

          <div
            id="custom-toolbar"
            className="mb-8 flex items-center space-x-3 rounded-2xl border border-amber-100 bg-amber-50/65 px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
          >
            <span className="ql-formats flex space-x-1">
              <button className="ql-bold"></button>
              <button className="ql-italic"></button>
              <button className="ql-underline"></button>
            </span>
            <div className="h-5 w-px bg-gray-200 dark:bg-slate-700"></div>
            <span className="ql-formats flex items-center space-x-2">
              <button
                className="ql-header text-sm font-bold text-gray-500 dark:text-slate-400"
                value="1"
              >
                H1
              </button>
              <button
                className="ql-header text-sm font-bold text-gray-500 dark:text-slate-400"
                value="2"
              >
                H2
              </button>
              <button
                className="ql-header text-sm font-bold text-gray-500 dark:text-slate-400"
                value="3"
              >
                H3
              </button>
            </span>

            <div className="h-5 w-px bg-gray-200 dark:bg-slate-700"></div>
            <span className="ql-formats flex space-x-1">
              <button className="ql-list" value="bullet"></button>
              <button className="ql-list" value="ordered"></button>
              <button className="ql-blockquote"></button>
            </span>
          </div>
          {/* Active prompt card */}
          {activePrompt && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800/60 dark:bg-teal-950/30">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-teal-800 dark:text-teal-200">
                {activePrompt}
              </p>
              <button
                onClick={() => setActivePrompt(null)}
                className="mt-0.5 shrink-0 rounded-lg p-0.5 text-teal-500 transition-colors hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-teal-900/50 dark:hover:text-teal-300"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <div
            data-write-editor
            className="rounded-2xl p-3   border-amber-100 bg-white/95  shadow-inner dark:border-slate-700 dark:bg-slate-900/60 "
          >
            <div ref={editorRef} className="custom-quill-editor" />
          </div>
        </section>
      </main>
      {/* Eddy floating pill button — desktop only */}
      {eddyAnchor && !eddyModalOpen && !isMobileView && (
        <button
          style={{
            position: "fixed",
            top: Math.max(8, eddyAnchor.rect.top - 38),
            left: eddyAnchor.rect.left + eddyAnchor.rect.width / 2,
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setEddyModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-teal-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-colors hover:bg-teal-600"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Ask Eddia
        </button>
      )}

      {/* Eddy modal — desktop */}
      {eddyModalOpen && eddyAnchor && (
        <EddyModal
          selectedText={eddyAnchor.text}
          fullJournalText={stripHtml(editorHtml)}
          anchorRect={eddyAnchor.rect}
          onClose={() => {
            setEddyModalOpen(false);
            setEddyAnchor(null);
          }}
        />
      )}

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:hidden">
        <button
          onClick={() => setShowPrompts(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors active:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
        >
          <svg
            className="h-4 w-4 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Prompts
        </button>
        <button
          onClick={() => setMobileEddyOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-teal-500/25 transition-colors active:bg-teal-600"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Ask Eddia
        </button>
      </div>

      {/* Eddy modal — mobile */}
      {mobileEddyOpen && (
        <EddyModal
          selectedText={eddyAnchor?.text ?? ""}
          fullJournalText={stripHtml(editorHtml)}
          anchorRect={null}
          onClose={() => setMobileEddyOpen(false)}
        />
      )}

      {/* Journal prompts panel */}
      {showPrompts && (
        <JournalPrompts
          onSelect={selectPrompt}
          onClose={() => setShowPrompts(false)}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ql-toolbar.ql-snow { border: none; padding: 10; font-family: inherit; }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { padding: 0.25rem 0.25rem 2rem; font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.15rem; line-height: 1.9; color: #334155; min-height: 420px; }
        .ql-editor p { margin-bottom: 0.65rem; }
        .ql-editor blockquote { border-left: 3px solid #99f6e4; padding-left: 1.5rem; margin-left: 0; font-style: italic; color: #94a3b8; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; margin-top: 1.5em; margin-bottom: 0.5em; }
        #custom-toolbar button { width: 28px; height: 28px; border-radius: 4px; transition: background-color 0.2s ease; }
        #custom-toolbar button:hover { background-color: #f3f4f6; }
        #custom-toolbar button.ql-active { color: #0d9488 !important; }
        #custom-toolbar button.ql-active .ql-stroke { stroke: #0d9488 !important; }
        #custom-toolbar button.ql-active .ql-fill { fill: #0d9488 !important; }
        .dark .ql-toolbar.ql-snow .ql-stroke { stroke: #94a3b8; }
        .dark .ql-toolbar.ql-snow .ql-fill { fill: #94a3b8; }
        .dark .ql-toolbar.ql-snow .ql-picker { color: #94a3b8; }
        .dark #custom-toolbar button:hover { background-color: #1e293b; }
        .dark .ql-editor { color: #cbd5e1; }
        .dark .ql-editor.ql-blank::before { color: #64748b; }
        .dark .ql-editor blockquote { color: #94a3b8; border-left-color: rgba(45, 212, 191, 0.55); }
        .dark .ql-editor h1, .dark .ql-editor h2, .dark .ql-editor h3 { color: #f8fafc; }
      `,
        }}
      />
    </div>
  );
}

function stripHtml(content: string) {
  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function sanitizeEditorHtml(content: string) {
  return content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");
}

function normalizeTitleForCompare(content: string) {
  return content.replace(/\s+/g, " ").trim();
}

function normalizeHtmlForCompare(content: string) {
  return content.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
}

function resolveJournalTimestamp(journal: JournalTimestampRecord) {
  return (
    parseJournalTimestamp(journal.updatedAt) ??
    parseJournalTimestamp(journal.updated_at) ??
    parseJournalTimestamp(journal.createdAt) ??
    parseJournalTimestamp(journal.created_at)
  );
}

function resolveSavedJournalId(
  journal: JournalSaveRecord | null | undefined,
  fallbackJournalId?: string | null,
) {
  const candidate =
    journal?.id ?? journal?.journalId ?? fallbackJournalId ?? null;

  if (candidate == null) {
    return null;
  }

  const normalizedJournalId = String(candidate).trim();
  return normalizedJournalId || null;
}

async function syncJournalAnalysis({
  journalId,
  plainContent,
}: {
  journalId: string | null;
  plainContent: string;
}) {
  if (!journalId || !plainContent.trim()) {
    return;
  }

  try {
    await generateJournalSegments({
      journalEntryId: journalId,
      content: plainContent,
    });
    await analyzeJournalSentiment({ journal_id: journalId });
  } catch (error) {
    console.error("Failed to sync journal segments and sentiment:", error);
  }
}

function clearJournalSessionCache(userId: string, journalId: string | null) {
  if (!userId || !journalId || typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(
      `${JOURNAL_DETAIL_SESSION_CACHE_PREFIX}:${userId}:${journalId}`,
    );
    window.sessionStorage.removeItem(
      `${JOURNAL_INSIGHTS_SESSION_CACHE_PREFIX}:${userId}:${journalId}`,
    );
  } catch (error) {
    console.warn("Failed to clear journal session cache:", error);
  }
}
