"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Circle,
  FileText,
  MoreHorizontal,
  Palette,
  Type,
} from "lucide-react";
import { useReflections } from "@/components/providers/reflections-provider";
import type Quill from "quill";

const toolbarOptions = [
  ["bold", "italic", "underline"],
  [{ header: 1 }, { header: 2 }, { header: 3 }],
  [{ list: "bullet" }, { list: "ordered" }],
  ["blockquote", "code-block"],
  ["link"],
];

const TITLE = "Daily Equilibrium Check-in";
const PREVIEW_MAX_LENGTH = 200;

function formatTimestamp(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Page() {
  const router = useRouter();
  const { addEntry } = useReflections();
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const textChangeHandlerRef = useRef<(() => void) | null>(null);
  const [canSave, setCanSave] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;
    if (!editorRef.current || quillRef.current) return;

    let mounted = true;

    async function initQuill() {
      const [{ default: QuillModule }] = await Promise.all([
        import("quill"),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- CSS module, no types
        // @ts-ignore
        import("quill/dist/quill.snow.css"),
      ]);

      if (!mounted || !editorRef.current) return;

      const quill = new QuillModule(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
      });

      quillRef.current = quill;

      const updateCanSave = () => {
        const text = quill.getText().trim();
        setCanSave(text.length > 0);
      };

      textChangeHandlerRef.current = updateCanSave;
      quill.on("text-change", updateCanSave);
      updateCanSave();
    }

    initQuill();

    return () => {
      mounted = false;
      const q = quillRef.current;
      const handler = textChangeHandlerRef.current;
      if (q && handler) {
        q.off("text-change", handler);
      }
      quillRef.current = null;
      textChangeHandlerRef.current = null;
    };
  }, [isMounted]);

  const handleSave = useCallback(() => {
    const quill = quillRef.current;
    if (!quill || !canSave) return;

    const fullText = quill.getText().trim();
    if (fullText.length === 0) return;

    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    const preview =
      fullText.length <= PREVIEW_MAX_LENGTH
        ? fullText
        : fullText.slice(0, PREVIEW_MAX_LENGTH).trim() + "…";

    const now = new Date();

    addEntry({
      title: TITLE,
      timestamp: formatTimestamp(now),
      mood: "Self-Guided",
      preview,
      wordCount: `${wordCount} words`,
      action: "View",
      moodClass: "border-teal-100 bg-teal-50 text-teal-700",
      dotClass: "bg-teal-500",
      subBadge: "Self-Guided Reflection",
    });

    router.push("/journals-reflections/archive");
  }, [addEntry, canSave, router]);

  const displayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <TopBar onSave={handleSave} canSave={canSave} />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Metadata */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {TITLE}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {displayDate}
            </span>
            <span className="flex items-center gap-1.5 rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
              <FileText size={12} />
              Self-Guided Reflection
            </span>
          </div>
        </div>

        {/* Editor wrapper - scoped for Quill overrides */}
        <div
          className="write-editor-wrapper rounded-xl border border-slate-200 bg-white shadow-sm"
          data-write-editor
        >
          {!isMounted ? (
            <div className="flex min-h-[320px] items-center justify-center text-slate-500">
              Loading editor…
            </div>
          ) : (
            <div ref={editorRef} className="min-h-[320px]" />
          )}
        </div>
      </div>
    </div>
  );
}

function TopBar({ onSave, canSave }: { onSave: () => void; canSave: boolean }) {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <Link
            href="/journals-reflections"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <span className="text-slate-300">/</span>
          <span className="flex items-center gap-1.5 text-teal-600">
            <Circle className="h-2.5 w-2.5 fill-current" />
            Vault Secured
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Type size={14} className="mr-1.5 inline" />
            Typography
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50"
          >
            Mood
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              canSave
                ? "border-teal-100 bg-teal-500 text-white hover:bg-teal-600"
                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            <Palette size={14} />
            Save Reflection
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
