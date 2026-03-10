"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Grid2x2, List, Plus, Search, Shield } from "lucide-react";
import LongMenu from "@/components/ui/long-menu";
import { GetUserJournals } from "@/api/journal";

type RawJournal = {
  id?: string;
  userId?: string;
  user_id?: string;

  createdAt?: number | string;
  created_at?: number | string;
  createdOn?: number | string;
  created_on?: number | string;
  dateCreated?: number | string;
  date_created?: number | string;
  journalDate?: number | string;
  date?: number | string;
  timestamp?: string;
  updatedAt?: number | string;

  mood?: string;
  title?: string;
  content?: string;
  preview?: string;
  tags?: string[];
  subBadge?: string;
  wordCount?: string | number;
  action?: string;
  moodClass?: string;
  dotClass?: string;
};

type JournalEntri = {
  id: string;
  userId: string;
  createdAt: number | null;
  rawDateLabel: string;
  mood: string;
  title: string;
  content: string;
  preview: string;
  tags: string[];
  subBadge?: string;
  wordCount: string;
  action: string;
  moodClass: string;
  dotClass: string;
};

type DateFilter = "7" | "30" | "90" | "all";
type ViewMode = "card" | "list";

export default function JournalsArchivePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const [selectedDate, setSelectedDate] = useState<DateFilter>("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [journals, setJournals] = useState<JournalEntri[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = "7e9793a6-c652-4b3a-8bed-780c221ee33a";

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setIsLoading(true);

        const response = await GetUserJournals(userId);

        if (!Array.isArray(response)) {
          console.warn("GetUserJournals did not return an array:", response);
          setJournals([]);
          return;
        }

        const normalized = response
          .map((entry: RawJournal, index: number) =>
            normalizeJournal(entry, index),
          )
          .filter(Boolean) as JournalEntri[];

        normalized.sort(sortJournalsNewestFirst);

        setJournals(normalized);
      } catch (error) {
        console.error("Failed to fetch journals:", error);
        setJournals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournals();
  }, [userId]);

  const moodOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          journals.map((entry) => entry.mood.toLowerCase()).filter(Boolean),
        ),
      ),
    ],
    [journals],
  );

  const tagOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          journals
            .flatMap(getEntryTags)
            .map((tag) => tag.toLowerCase())
            .filter(Boolean),
        ),
      ),
    ],
    [journals],
  );

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const days = selectedDate === "all" ? null : Number(selectedDate);
    const cutoff = days === null ? null : getCutoffDate(days, new Date());

    const result = journals.filter((entry) => {
      if (selectedMood !== "all" && entry.mood.toLowerCase() !== selectedMood) {
        return false;
      }

      const entryTags = getEntryTags(entry).map((tag) => tag.toLowerCase());
      if (selectedTag !== "all" && !entryTags.includes(selectedTag)) {
        return false;
      }

      if (cutoff) {
        if (!entry.createdAt) return false;
        if (entry.createdAt < cutoff.getTime()) return false;
      }

      if (!query) return true;

      const searchableText = [
        entry.title,
        entry.preview,
        entry.content,
        entry.mood,
        entry.rawDateLabel,
        ...entryTags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });

    return [...result].sort(sortJournalsNewestFirst);
  }, [journals, searchQuery, selectedMood, selectedDate, selectedTag]);

  const canClearFilters =
    searchQuery.trim().length > 0 ||
    selectedMood !== "all" ||
    selectedDate !== "all" ||
    selectedTag !== "all";

  function clearFilters() {
    setSearchQuery("");
    setSelectedMood("all");
    setSelectedDate("all");
    setSelectedTag("all");
  }

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <HeaderSection viewMode={viewMode} setViewMode={setViewMode} />

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedMood={selectedMood}
          onSelectedMoodChange={setSelectedMood}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          selectedTag={selectedTag}
          onSelectedTagChange={setSelectedTag}
          moodOptions={moodOptions}
          tagOptions={tagOptions}
          canClearFilters={canClearFilters}
          onClearFilters={clearFilters}
        />

        {isLoading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading journals...
          </section>
        ) : viewMode === "card" ? (
          <JournalGrid entries={filteredEntries} />
        ) : (
          <ListView entries={filteredEntries} />
        )}
      </main>

      <FooterStrip />
    </div>
  );
}

function HeaderSection({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Journal &amp; Reflections
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Archived insights from your personal health intelligence journey.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("card")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition-all ${
            viewMode === "card"
              ? "bg-white text-slate-900 shadow-sm"
              : "bg-slate-50 text-slate-400 hover:text-slate-700"
          }`}
          aria-label="Card view"
        >
          <Grid2x2 size={16} />
        </button>

        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition-all ${
            viewMode === "list"
              ? "bg-white text-slate-900 shadow-sm"
              : "bg-slate-50 text-slate-400 hover:text-slate-700"
          }`}
          aria-label="List view"
        >
          <List size={16} />
        </button>

        <Link
          href="/journals-reflections/write"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-teal-600"
        >
          <Plus size={14} />
          New Journal Entry
        </Link>
      </div>
    </section>
  );
}

function FilterToolbar({
  searchQuery,
  onSearchQueryChange,
  selectedMood,
  onSelectedMoodChange,
  selectedDate,
  onSelectedDateChange,
  selectedTag,
  onSelectedTagChange,
  moodOptions,
  tagOptions,
  canClearFilters,
  onClearFilters,
}: {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedMood: string;
  onSelectedMoodChange: (value: string) => void;
  selectedDate: DateFilter;
  onSelectedDateChange: (value: DateFilter) => void;
  selectedTag: string;
  onSelectedTagChange: (value: string) => void;
  moodOptions: string[];
  tagOptions: string[];
  canClearFilters: boolean;
  onClearFilters: () => void;
}) {
  const moodFilterOptions = moodOptions.map((mood) => ({
    value: mood,
    label: mood === "all" ? "All" : formatFilterLabel(mood),
  }));

  const dateFilterOptions: Array<{ value: DateFilter; label: string }> = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "all", label: "All Time" },
  ];

  const tagFilterOptions = tagOptions.map((tag) => ({
    value: tag,
    label: tag === "all" ? "All" : formatFilterLabel(tag),
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search entries, keywords, or sentiments..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:bg-white"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span className="mr-1 text-slate-400">Filters:</span>

          <FilterSelect
            prefix="Mood"
            value={selectedMood}
            options={moodFilterOptions}
            active={selectedMood !== "all"}
            onChange={onSelectedMoodChange}
          />

          <FilterSelect
            prefix="Date"
            value={selectedDate}
            options={dateFilterOptions}
            active={selectedDate !== "all"}
            onChange={(value) => onSelectedDateChange(value as DateFilter)}
          />

          <FilterSelect
            prefix="Tags"
            value={selectedTag}
            options={tagFilterOptions}
            active={selectedTag !== "all"}
            onChange={onSelectedTagChange}
          />

          <button
            type="button"
            disabled={!canClearFilters}
            onClick={onClearFilters}
            className={`rounded-md px-2 py-1 transition-colors ${
              canClearFilters
                ? "text-teal-700 hover:bg-teal-50"
                : "cursor-not-allowed text-slate-300"
            }`}
          >
            Clear All
          </button>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  prefix,
  value,
  options,
  active,
  onChange,
}: {
  prefix: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  active?: boolean;
  onChange: (value: string) => void;
}) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    options[0]?.label ??
    "All";

  return (
    <label
      className={`relative inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 ${
        active
          ? "border-teal-100 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <span>
        {prefix}: {selectedLabel}
      </span>
      <ChevronDown size={13} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none rounded-lg opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function JournalGrid({ entries }: { entries: JournalEntri[] }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AddCard />
      {entries.length > 0 ? (
        entries.map((entry) => <JournalCard key={entry.id} entry={entry} />)
      ) : (
        <EmptyStateCard />
      )}
    </section>
  );
}

function ListView({ entries }: { entries: JournalEntri[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[130px_190px_minmax(280px,1fr)_130px_140px_100px] gap-4 border-b border-slate-200 px-5 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Mood</span>
            <span>Date &amp; Time</span>
            <span>Entry Details</span>
            <span>Word Count</span>
            <span>Session Type</span>
            <span>Status</span>
          </div>

          {entries.length > 0 ? (
            entries.map((entry) => <ListRow key={entry.id} entry={entry} />)
          ) : (
            <div className="px-5 py-10 text-center text-sm font-medium text-slate-500">
              No entries matched your current filters.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ListRow({ entry }: { entry: JournalEntri }) {
  return (
    <Link
      href={`/journals-reflections/my-journal/${entry.userId}/${entry.id}`}
      className="grid grid-cols-[130px_190px_minmax(280px,1fr)_130px_140px_100px] items-center gap-4 border-b border-slate-100 px-5 py-4 transition-colors hover:bg-slate-50 last:border-b-0"
    >
      <div>
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-700">
          {entry.mood}
        </span>
      </div>

      <p className="text-sm text-slate-500">
        {formatReadableDate(entry.createdAt)}
      </p>

      <div>
        <p className="font-semibold text-slate-900">{entry.title}</p>
        <p className="mt-1 truncate text-sm text-slate-500">{entry.preview}</p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {entry.wordCount}
      </p>

      <div>
        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
          {entry.action}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${entry.dotClass}`} />
        <span className="text-xs uppercase tracking-wider text-slate-400">
          Active
        </span>
      </div>
    </Link>
  );
}

function JournalCard({ entry }: { entry: JournalEntri }) {
  return (
    <Link href={`/journals-reflections/my-journal/${entry.userId}/${entry.id}`}>
      <article className="flex min-h-[260px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="mb-4 flex items-start justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {formatCardDate(entry.createdAt)}
          </p>

          <section className="flex items-start gap-2">
            <span
              className={`rounded-md border px-2 py-3 text-[10px] font-bold uppercase ${entry.moodClass}`}
            >
              {entry.mood}
            </span>

            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <LongMenu />
            </div>
          </section>
        </div>

        <h3 className="text-lg font-bold text-slate-900">{entry.title}</h3>

        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-500">
          {entry.preview}
        </p>

        {entry.subBadge ? (
          <span className="mt-3 inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {entry.subBadge}
          </span>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className={`h-2 w-2 rounded-full ${entry.dotClass}`} />
            {getEstimatedReadTime(entry.content)}
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
          >
            {entry.action}
          </button>
        </div>
      </article>
    </Link>
  );
}

function AddCard() {
  return (
    <Link
      href="/journals-reflections/write"
      className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-slate-500 transition-colors hover:border-teal-200 hover:bg-teal-50/40 hover:text-teal-700"
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white">
        <Plus size={18} />
      </span>
      <span className="text-xs font-bold uppercase tracking-widest">
        New Reflection
      </span>
    </Link>
  );
}

function EmptyStateCard() {
  return (
    <article className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-700">
        No entries matched your filters.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Try adjusting search, mood, date, or tag.
      </p>
    </article>
  );
}

function FooterStrip() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2">
          <Shield size={12} />
          Enterprise AES-256 Vault Encryption
        </div>

        <div className="flex items-center gap-3">
          <span>Cloud Sync: 100% Complete</span>
          <span className="h-1 w-20 overflow-hidden rounded-full bg-slate-200">
            <span className="block h-full w-full bg-teal-500" />
          </span>
        </div>
      </div>
    </footer>
  );
}

function normalizeJournal(
  entry: RawJournal,
  index: number,
): JournalEntri | null {
  const id = String(entry.id ?? `journal-${index}`);
  const userId = String(entry.userId ?? entry.user_id ?? "");

  const rawTitle = String(entry.title ?? "").trim();
  const rawContent = String(entry.content ?? "").trim();
  const rawPreview = String(entry.preview ?? "").trim();

  const cleanTitle =
    sanitizeDisplayText(stripHtml(rawTitle)) || "Untitled Journal Entry";
  const cleanContent = sanitizeDisplayText(stripHtml(rawContent));
  const cleanPreviewFromApi = sanitizeDisplayText(stripHtml(rawPreview));
  const fallbackPreview = truncateText(cleanContent, 140);

  const parsedDate = parseJournalDate(entry);

  const mood = normalizeMood(entry.mood);
  const tags = Array.isArray(entry.tags)
    ? entry.tags.map((tag) => sanitizeDisplayText(String(tag))).filter(Boolean)
    : [];
  const action = normalizeAction(entry.action, entry.subBadge);
  const wordCount = getWordCountLabel(cleanContent);

  return {
    id,
    userId,
    createdAt: parsedDate,
    rawDateLabel: parsedDate ? new Date(parsedDate).toISOString() : "",
    mood,
    title: cleanTitle,
    content: cleanContent,
    preview: cleanPreviewFromApi || fallbackPreview || "No preview available.",
    tags,
    subBadge: entry.subBadge ? sanitizeDisplayText(entry.subBadge) : undefined,
    wordCount,
    action,
    moodClass: getMoodClass(mood),
    dotClass: getMoodDotClass(mood),
  };
}

function sortJournalsNewestFirst(a: JournalEntri, b: JournalEntri) {
  const aTime = a.createdAt ?? -1;
  const bTime = b.createdAt ?? -1;

  const aHasValidDate = aTime > 0;
  const bHasValidDate = bTime > 0;

  if (aHasValidDate && bHasValidDate) {
    return bTime - aTime;
  }

  if (aHasValidDate && !bHasValidDate) return -1;
  if (!aHasValidDate && bHasValidDate) return 1;

  return a.title.localeCompare(b.title);
}

function parseJournalDate(entry: RawJournal): number | null {
  const possibleValues: Array<number | string | undefined> = [
    entry.createdAt,
    entry.created_at,
    entry.createdOn,
    entry.created_on,
    entry.dateCreated,
    entry.date_created,
    entry.journalDate,
    entry.date,
    entry.timestamp,
    entry.updatedAt,
  ];

  for (const value of possibleValues) {
    const parsed = parseDateValue(value);
    if (parsed) return parsed;
  }

  return null;
}

function parseDateValue(value?: number | string): number | null {
  if (value === undefined || value === null) return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;

    // unix seconds
    if (value < 1_000_000_000_000) {
      const secondsToMs = value * 1000;
      return isValidTimestamp(secondsToMs) ? secondsToMs : null;
    }

    return isValidTimestamp(value) ? value : null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  if (
    trimmed === "0001-01-01T00:00:00" ||
    trimmed === "0001-01-01T00:00:00Z" ||
    trimmed === "0001-01-01"
  ) {
    return null;
  }

  // numeric string
  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;

    if (trimmed.length <= 10) {
      const secondsToMs = numeric * 1000;
      return isValidTimestamp(secondsToMs) ? secondsToMs : null;
    }

    return isValidTimestamp(numeric) ? numeric : null;
  }

  const parsed = new Date(trimmed).getTime();
  if (!Number.isNaN(parsed) && isValidTimestamp(parsed)) {
    return parsed;
  }

  return null;
}

function isValidTimestamp(timestampMs: number) {
  const year = new Date(timestampMs).getFullYear();
  return year >= 2000 && year <= 2100;
}

function normalizeMood(mood?: string) {
  const value = String(mood ?? "neutral")
    .trim()
    .toLowerCase();

  if (["happy", "positive", "good", "joyful"].includes(value))
    return "Positive";
  if (["sad", "negative", "low", "down"].includes(value)) return "Low";
  if (["anxious", "stressed", "overwhelmed"].includes(value)) return "Stressed";
  if (["neutral", "okay", "ok"].includes(value)) return "Neutral";

  return value ? formatFilterLabel(value) : "Neutral";
}

function normalizeAction(action?: string, subBadge?: string) {
  const value = String(action ?? subBadge ?? "GUIDED").trim();
  return value ? sanitizeDisplayText(value).toUpperCase() : "GUIDED";
}

function getMoodClass(mood: string) {
  const value = mood.toLowerCase();

  if (value.includes("positive")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (value.includes("low")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (value.includes("stressed")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-white text-slate-700";
}

function getMoodDotClass(mood: string) {
  const value = mood.toLowerCase();

  if (value.includes("positive")) return "bg-emerald-500";
  if (value.includes("low")) return "bg-rose-500";
  if (value.includes("stressed")) return "bg-amber-500";

  return "bg-slate-400";
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeDisplayText(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength = 140) {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function getWordCountLabel(content: string) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return `${words} words`;
}

function getEstimatedReadTime(content: string) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatReadableDate(timestampMs: number | null) {
  if (!timestampMs) return "Unknown date";

  return new Date(timestampMs).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCardDate(timestampMs: number | null) {
  if (!timestampMs) return "Unknown date";

  return new Date(timestampMs).toLocaleString("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFilterLabel(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function getEntryTags(entry: JournalEntri) {
  if (entry.tags && entry.tags.length > 0) {
    return entry.tags;
  }

  const text = `${entry.title} ${entry.preview} ${entry.content}`.toLowerCase();
  const inferredTags: string[] = [];

  if (
    /(work|task|project|quarter|review|meeting|deadline|focus|career)/.test(
      text,
    )
  ) {
    inferredTags.push("Work");
  }
  if (
    /(calm|sleep|detox|health|wellness|anxiety|stress|energy|recovery)/.test(
      text,
    )
  ) {
    inferredTags.push("Wellness");
  }
  if (/(reflection|growth|resilience|gratitude|mindset|clarity)/.test(text)) {
    inferredTags.push("Growth");
  }

  return inferredTags.length > 0 ? inferredTags : ["General"];
}

function getCutoffDate(days: number, referenceNow: Date) {
  const cutoff = new Date(referenceNow);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}
