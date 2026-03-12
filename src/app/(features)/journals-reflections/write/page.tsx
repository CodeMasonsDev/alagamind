"use client";

import React, { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import { MakeJournal, updateJournal } from "@/services/journals";
import { useReflections } from "@/components/providers/reflections-provider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GetUserJournal } from "@/api/journal";

type QuillEditor = import("quill").default;

export default function ReflectionEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillEditor | null>(null);

  const [title, setTitle] = useState("Daily Equilibrium Check-in");
  const [isSaving, setIsSaving] = useState(false);
  const [journalId, setJournalId] = useState<string | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isHydratingUpdate, setIsHydratingUpdate] = useState(false);
  const [editorHtml, setEditorHtml] = useState("");
  const [baselineTitle, setBaselineTitle] = useState("");
  const [baselineEditorHtml, setBaselineEditorHtml] = useState("");
  const searchParams = useSearchParams();

  const defaultUserId = "7e9793a6-c652-4b3a-8bed-780c221ee33a";
  const requestedUserId = searchParams.get("userId")?.trim();
  const requestedJournalId = searchParams.get("journalId")?.trim();
  const userId = requestedUserId || defaultUserId;
  const isUpdateMode = Boolean(requestedJournalId || journalId);
  const hasPendingChanges =
    !isUpdateMode ||
    normalizeTitleForCompare(title) !== normalizeTitleForCompare(baselineTitle) ||
    normalizeHtmlForCompare(editorHtml) !==
      normalizeHtmlForCompare(baselineEditorHtml);
  const isSaveDisabled =
    isSaving || isHydratingUpdate || (isUpdateMode && !hasPendingChanges);

  const { refreshEntries, addEntry } = useReflections();

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
          placeholder: "Start your reflection...",
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

    if (!requestedJournalId) {
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
    setIsHydratingUpdate(false);
  }, [isEditorReady, requestedJournalId]);

  const handleSaveReflection = async () => {
    if (!quillRef.current) return;

    setIsSaving(true);

    try {
      const htmlContent = quillRef.current.root.innerHTML;
      const plainContent = stripHtml(htmlContent);
      const resolvedTitle = title.trim() || "Untitled Reflection";

      if (journalId) {
        const payload = {
          userId,
          journalId,
          title: resolvedTitle,
          content: htmlContent,
        };

        const updateRes = await updateJournal(payload);
        if (!updateRes) throw new Error("Update failed: Empty response");

        const savedHtml = quillRef.current.root.innerHTML;
        setEditorHtml(savedHtml);
        setBaselineEditorHtml(savedHtml);
        setBaselineTitle(resolvedTitle);

        await refreshEntries();
      } else {
        const payload = {
          userId,
          title: resolvedTitle,
          content: htmlContent,
        };

        const data = await MakeJournal(payload);
        if (!data) throw new Error("Create failed: Empty response");

        const newId = data.journalId ?? data.id;
        if (newId) {
          setJournalId(newId);
        }

        const savedHtml = quillRef.current.root.innerHTML;
        setEditorHtml(savedHtml);
        setBaselineEditorHtml(savedHtml);
        setBaselineTitle(resolvedTitle);

        addEntry({
          id: newId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: formatTimestamp(Date.now()),
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

        await refreshEntries();
      }
    } catch (error) {
      console.error("Failed to save journal:", error);
      alert("Failed to save reflection. Check the console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-6 text-sm font-medium text-gray-500">
          <Link
            href="/journals-reflections/archive"
            className="flex items-center hover:text-gray-900 transition-colors"
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
            onClick={handleSaveReflection}
            disabled={isSaveDisabled}
            className="flex items-center px-4 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-2"
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

          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-10">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-4xl font-bold tracking-tight text-gray-900 mb-6 w-full border-none outline-none bg-transparent placeholder-gray-300 focus:ring-0"
            placeholder="Entry Title..."
          />

          <div className="grid grid-cols-[120px_1fr] gap-y-4 text-sm">
            <div className="flex items-center text-gray-400">
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
            <div className="font-medium text-gray-700">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="flex items-center text-gray-400">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Session Type
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                Self-Guided Reflection
              </span>
            </div>
          </div>
        </div>

        <div
          id="custom-toolbar"
          className="flex items-center space-x-3 px-4 py-2 mb-8 bg-white border border-gray-100 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)]"
        >
          <span className="ql-formats flex space-x-1">
            <button className="ql-bold"></button>
            <button className="ql-italic"></button>
            <button className="ql-underline"></button>
          </span>
          <div className="w-px h-5 bg-gray-200"></div>
          <span className="ql-formats flex items-center space-x-2">
            <button
              className="ql-header text-gray-500 font-bold text-sm"
              value="1"
            >
              H1
            </button>
            <button
              className="ql-header text-gray-500 font-bold text-sm"
              value="2"
            >
              H2
            </button>
            <button
              className="ql-header text-gray-500 font-bold text-sm"
              value="3"
            >
              H3
            </button>
          </span>

          <div className="w-px h-5 bg-gray-200"></div>
          <span className="ql-formats flex space-x-1">
            <button className="ql-list" value="bullet"></button>
            <button className="ql-list" value="ordered"></button>
            <button className="ql-blockquote"></button>
          </span>
          <div className="w-px h-5 bg-gray-200"></div>
          <span className="ql-formats flex space-x-1">
            <button className="ql-code-block"></button>
            <button className="ql-link"></button>
          </span>
        </div>
        <div ref={editorRef} className="custom-quill-editor" />
      </main>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ql-toolbar.ql-snow { border: none; padding: 10; font-family: inherit; }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { padding: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.15rem; line-height: 1.8; color: #374151; min-height: 400px; }
        .ql-editor blockquote { border-left: 3px solid #99f6e4; padding-left: 1.5rem; margin-left: 0; font-style: italic; color: #94a3b8; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #111827; margin-top: 1.5em; margin-bottom: 0.5em; }
        #custom-toolbar button { width: 28px; height: 28px; border-radius: 4px; transition: background-color 0.2s ease; }
        #custom-toolbar button:hover { background-color: #f3f4f6; }
        #custom-toolbar button.ql-active { color: #0d9488 !important; }
        #custom-toolbar button.ql-active .ql-stroke { stroke: #0d9488 !important; }
        #custom-toolbar button.ql-active .ql-fill { fill: #0d9488 !important; }
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

function formatTimestamp(createdAt: number) {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
