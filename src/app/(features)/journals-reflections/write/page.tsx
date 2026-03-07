"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useReflections } from "@/components/providers/reflections-provider";
import {
  ArrowLeft,
  Bold,
  Circle,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Palette,
  PenLine,
  Quote,
  Underline,
} from "lucide-react";

const TOOLBAR_ITEMS = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Underline", icon: Underline },
  { label: "H1", icon: Heading1 },
  { label: "H2", icon: Heading2 },
  { label: "H3", icon: Heading3 },
  { label: "Bullets", icon: List },
  { label: "Numbered", icon: ListOrdered },
  { label: "Quote", icon: Quote },
  { label: "Divider", icon: Minus },
  { label: "Edit", icon: PenLine },
] as const;
type ToolbarAction = (typeof TOOLBAR_ITEMS)[number]["label"];
type SaveFeedback = {
  type: "success" | "error";
  message: string;
};

export default function JournalWritingPage() {
  const { addEntry } = useReflections();
  const [draft, setDraft] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const isDraftEmpty = draft.trim().length === 0;
  const currentDateLabel = useMemo(() => formatDisplayDate(new Date()), []);

  useEffect(() => {
    if (!saveFeedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSaveFeedback(null);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [saveFeedback]);

  function handleSave() {
    if (isDraftEmpty) {
      setSaveFeedback({
        type: "error",
        message: "Write something first before saving your reflection.",
      });
      return;
    }

    addEntry({
      timestamp: formatTimestamp(new Date()),
      mood: "REFLECTIVE",
      title: buildTitleFromDraft(draft),
      preview: buildPreviewFromDraft(draft),
      tags: ["General"],
      wordCount: `${countWords(draft)} words`,
      action: "Open Entry",
      moodClass: "bg-violet-50 text-violet-700 border-violet-100",
      dotClass: "bg-violet-500",
    });
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setSaveFeedback({
      type: "success",
      message: "Reflection saved successfully.",
    });
  }

  const saveLabel = useMemo(() => {
    if (!savedAt) {
      return "Not yet saved";
    }
    return `Saved at ${savedAt}`;
  }, [savedAt]);

  function applyToolbarAction(action: ToolbarAction) {
    const textarea = editorRef.current;
    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = draft.slice(selectionStart, selectionEnd);

    const replaceSelection = ({
      text,
      nextStart,
      nextEnd,
    }: {
      text: string;
      nextStart?: number;
      nextEnd?: number;
    }) => {
      const nextDraft =
        draft.slice(0, selectionStart) + text + draft.slice(selectionEnd);
      setDraft(nextDraft);

      const start = nextStart ?? selectionStart + text.length;
      const end = nextEnd ?? start;
      window.requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, end);
      });
    };

    const wrapSelection = (
      prefix: string,
      suffix: string,
      fallbackText: string,
    ) => {
      const innerText = selectedText || fallbackText;
      const nextText = `${prefix}${innerText}${suffix}`;
      const start = selectionStart + prefix.length;
      const end = start + innerText.length;
      replaceSelection({ text: nextText, nextStart: start, nextEnd: end });
    };

    const formatLines = (formatter: (line: string, index: number) => string) => {
      const lines = (selectedText || "List item").split("\n");
      const nextText = lines.map(formatter).join("\n");
      replaceSelection({ text: nextText });
    };

    switch (action) {
      case "Bold":
        wrapSelection("**", "**", "bold text");
        break;
      case "Italic":
        wrapSelection("*", "*", "italic text");
        break;
      case "Underline":
        wrapSelection("<u>", "</u>", "underlined text");
        break;
      case "H1":
        formatLines((line) => `# ${line.replace(/^#+\s*/, "")}`);
        break;
      case "H2":
        formatLines((line) => `## ${line.replace(/^#+\s*/, "")}`);
        break;
      case "H3":
        formatLines((line) => `### ${line.replace(/^#+\s*/, "")}`);
        break;
      case "Bullets":
        formatLines((line) => `- ${line.replace(/^[-*]\s+/, "")}`);
        break;
      case "Numbered":
        formatLines((line, index) => `${index + 1}. ${line.replace(/^\d+\.\s+/, "")}`);
        break;
      case "Quote":
        formatLines((line) => `> ${line.replace(/^>\s*/, "")}`);
        break;
      case "Divider":
        replaceSelection({ text: "\n\n---\n\n" });
        break;
      case "Edit":
        textarea.focus();
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <TopBar onSave={handleSave} canSave={!isDraftEmpty} />

      {saveFeedback ? (
        <div className="pointer-events-none fixed right-6 top-6 z-50">
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
              saveFeedback.type === "success"
                ? "border-teal-100 bg-teal-50 text-teal-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
            role="status"
            aria-live="polite"
          >
            {saveFeedback.message}
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <HeaderBlock
            saveLabel={saveLabel}
            currentDateLabel={currentDateLabel}
          />
          <EditorToolbar onAction={applyToolbarAction} />
          <ReflectionEditor
            draft={draft}
            onChange={setDraft}
            editorRef={editorRef}
          />
        </section>
      </main>
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

function buildTitleFromDraft(draft: string) {
  const firstLine = draft
    .split("\n")
    .map((line) => line.replace(/^[-#>*\s]+/, "").trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return "Untitled Reflection";
  }

  return firstLine.length > 44 ? `${firstLine.slice(0, 44).trimEnd()}...` : firstLine;
}

function buildPreviewFromDraft(draft: string) {
  const cleaned = draft
    .replace(/[>#*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return "No reflection content yet.";
  }
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trimEnd()}...` : cleaned;
}

function countWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function formatTimestamp(date: Date) {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) {
    return `TODAY, ${time}`;
  }
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
  return `${day.toUpperCase()}, ${time}`;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function HeaderBlock({
  saveLabel,
  currentDateLabel,
}: {
  saveLabel: string;
  currentDateLabel: string;
}) {
  return (
    <section className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Daily Equilibrium Check-in
      </h1>

      <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Date
          </span>
          <span className="font-medium text-slate-700">
            <span suppressHydrationWarning>{currentDateLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Session Type
          </span>
          <span className="rounded-md border border-teal-100 bg-teal-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
            Self-Guided Reflection
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {saveLabel}
      </p>
    </section>
  );
}

function EditorToolbar({ onAction }: { onAction: (action: ToolbarAction) => void }) {
  return (
    <section className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="flex min-w-max items-center gap-1 px-2 py-2">
        {TOOLBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onAction(item.label)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ReflectionEditor({
  draft,
  onChange,
  editorRef,
}: {
  draft: string;
  onChange: (value: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mx-auto max-w-3xl">
        <textarea
          ref={editorRef}
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Start writing your reflection..."
          className="min-h-[520px] w-full resize-y border-0 bg-transparent font-serif text-lg leading-9 text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
    </article>
  );
}
