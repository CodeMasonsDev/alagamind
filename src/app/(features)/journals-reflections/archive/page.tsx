"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Grid2x2, List, Plus, Search } from "lucide-react";
import LongMenu from "@/components/ui/long-menu";
import { GetUserJournals } from "@/api/journal";
import {
  getJournalSentimentPercentages,
  type JournalSentimentPercentagesResponse,
} from "@/api/journal-sentiment";
import { DeleteJournalId } from "@/services/journals";
import { getMe, SessionUser } from "@/api/auth/auth";
import {
  formatJournalDateTime,
  parseJournalTimestamp,
} from "@/lib/journal-datetime";

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
  journalId?: string;
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
  sentimentJournalId: string;
  createdAt: number | null;
  rawDateLabel: string;
  mood: string;
  dominantSentiment: string;
  title: string;
  content: string;
  preview: string;
  tags: string[];
  wordCount: string;
  moodClass: string;
  dotClass: string;
};

type DateFilter = "7" | "30" | "90" | "all";
type ViewMode = "card" | "list";
const JOURNAL_INSIGHTS_SESSION_CACHE_PREFIX = "journal-insights";
const JOURNAL_ARCHIVE_SENTIMENT_CACHE_PREFIX = "journal-archive-sentiment";

export default function JournalsArchivePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const [selectedDate, setSelectedDate] = useState<DateFilter>("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [journals, setJournals] = useState<JournalEntri[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // const userId = "7e9793a6-c652-4b3a-8bed-780c221ee33a";
  const [profile, setProfile] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const currentUser = await getMe();
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
    if (!userId) {
      setJournals([]);
      setIsLoading(false);
      return;
    }

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

        const normalizedWithSentiment = await enrichJournalsWithSentiment(
          normalized,
          userId,
        );

        normalizedWithSentiment.sort(sortJournalsNewestFirst);

        setJournals(normalizedWithSentiment);
        console.log(response);
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

  const HandlesDelete = async (userId: string, journalId: string) => {
    const res = await DeleteJournalId(userId, journalId);

    if (!res) console.log("unable to delete journal");

    console.log("Journal deleted successfully!");
    setJournals((prev) => prev.filter((j) => j.id !== journalId));
  };

  const handleUpdate = (userId: string, journalId: string) => {
    const queryParams = new URLSearchParams({
      userId,
      journalId,
    });

    router.push(`/journals-reflections/write?${queryParams.toString()}`);
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
      {/* <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100">Journal-reflections</span>
        </div>
      </header> */}
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
          <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Loading journals...
          </section>
        ) : viewMode === "card" ? (
          <JournalGrid
            entries={filteredEntries}
            onDelete={HandlesDelete}
            onUpdate={handleUpdate}
          />
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Journal &amp; Reflections
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Archived insights from your personal health intelligence journey.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("card")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition-all dark:border-slate-700 ${
            viewMode === "card"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
              : "bg-slate-50 text-slate-400 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
          aria-label="Card view"
        >
          <Grid2x2 size={16} />
        </button>

        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 transition-all dark:border-slate-700 ${
            viewMode === "list"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
              : "bg-slate-50 text-slate-400 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search entries, keywords, or sentiments..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-200 focus:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-teal-400/50 dark:focus:bg-slate-800"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span className="mr-1 text-slate-400 dark:text-slate-500">
            Filters:
          </span>

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

          <button
            type="button"
            disabled={!canClearFilters}
            onClick={onClearFilters}
            className={`rounded-md px-2 py-1 transition-colors ${
              canClearFilters
                ? "text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20"
                : "cursor-not-allowed text-slate-300 dark:text-slate-600"
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
          ? "border-teal-100 bg-teal-50 text-teal-700 dark:border-teal-900/30 dark:bg-teal-900/20 dark:text-teal-300"
          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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

type Params = {
  entries: JournalEntri[];
  onDelete: (useId: string, journalId: string) => void;
  onUpdate: (userId: string, journalId: string) => void;
};

function JournalGrid({ entries, onDelete, onUpdate }: Params) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AddCard />
      {entries.length > 0 ? (
        entries.map((entry) => (
          <JournalCard
            key={entry.id}
            entries={entry}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))
      ) : (
        <EmptyStateCard />
      )}
    </section>
  );
}

function ListView({ entries }: { entries: JournalEntri[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[130px_190px_minmax(280px,1fr)_130px_100px] gap-4 border-b border-slate-200 px-5 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <span>Mood</span>
            <span>Date &amp; Time</span>
            <span>Entry Details</span>
            <span>Word Count</span>
            <span>Status</span>
          </div>

          {entries.length > 0 ? (
            entries.map((entry) => <ListRow key={entry.id} entry={entry} />)
          ) : (
            <div className="px-5 py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
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
      className="grid grid-cols-[130px_190px_minmax(280px,1fr)_130px_100px] items-center gap-4 border-b border-slate-100 px-5 py-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 last:border-b-0"
    >
      <div>
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {entry.mood}
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {formatReadableDate(entry.createdAt)}
      </p>

      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {entry.title}
        </p>
        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
          {entry.preview}
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {entry.wordCount}
      </p>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${entry.dotClass}`} />
        <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Active
        </span>
      </div>
    </Link>
  );
}

type Props = {
  entries: JournalEntri;
  onDelete: (useId: string, journalId: string) => void;
  onUpdate: (userId: string, journalId: string) => void;
};
function JournalCard({ entries, onDelete, onUpdate }: Props) {
  return (
    <Link
      href={`/journals-reflections/my-journal/${entries.userId}/${entries.id}`}
    >
      <article className="flex min-h-[260px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
        <div className="mb-4 flex items-start justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {formatCardDate(entries.createdAt)}
          </p>

          <section className="flex items-start gap-2">
            <span
              className={`rounded-md border px-2 py-3 text-[10px] font-bold uppercase ${entries.moodClass}`}
            >
              {entries.mood}
            </span>

            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <LongMenu
                onDelete={() => onDelete(entries.userId, entries.id)}
                onUpdate={() => onUpdate(entries.userId, entries.id)}
              />
            </div>
          </section>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {entries.title}
        </h3>

        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {entries.preview}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className={`h-2 w-2 rounded-full ${entries.dotClass}`} />
            {getEstimatedReadTime(entries.content)}
          </div>
        </div>
      </article>
    </Link>
  );
}

function AddCard() {
  return (
    <Link
      href="/journals-reflections/write"
      className="hidden sm:flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-slate-500 transition-colors hover:border-teal-200 hover:bg-teal-50/40 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:bg-teal-900/10 dark:hover:text-teal-300"
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
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
    <article className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        No entries matched your filters.
      </p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Try adjusting search, mood, date, or tag.
      </p>
    </article>
  );
}

function FooterStrip() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between"></div>
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
  const wordCount = getWordCountLabel(cleanContent);

  return {
    id,
    userId,
    sentimentJournalId: String(entry.journalId ?? entry.id ?? id),
    createdAt: parsedDate,
    rawDateLabel: parsedDate ? new Date(parsedDate).toISOString() : "",
    mood,
    dominantSentiment: mood,
    title: cleanTitle,
    content: cleanContent,
    preview: cleanPreviewFromApi || fallbackPreview || "No preview available.",
    tags,
    wordCount,
    moodClass: getMoodClass(mood),
    dotClass: getMoodDotClass(mood),
  };
}

async function enrichJournalsWithSentiment(
  journals: JournalEntri[],
  userId: string,
) {
  const enriched = await Promise.all(
    journals.map(async (journal) => {
      const journalIds = Array.from(
        new Set(
          [journal.sentimentJournalId, journal.id]
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      );

      const cachedPercentages =
        readCachedArchiveSentimentPercentages(userId, journalIds) ??
        readCachedJournalSentimentPercentages(userId, journalIds);

      if (cachedPercentages) {
        const dominantSentiment = getDominantSentimentLabel(cachedPercentages);

        return {
          ...journal,
          mood: dominantSentiment,
          dominantSentiment,
          moodClass: getMoodClass(dominantSentiment),
          dotClass: getMoodDotClass(dominantSentiment),
        };
      }

      try {
        const percentages = await fetchJournalSentimentPercentagesForArchive(
          journalIds,
          userId,
        );
        const dominantSentiment = getDominantSentimentLabel(percentages);

        writeCachedArchiveSentimentPercentages(
          userId,
          journal.sentimentJournalId,
          percentages,
        );

        return {
          ...journal,
          mood: dominantSentiment,
          dominantSentiment,
          moodClass: getMoodClass(dominantSentiment),
          dotClass: getMoodDotClass(dominantSentiment),
        };
      } catch (error) {
        const cachedPercentages = readCachedJournalSentimentPercentages(
          userId,
          journalIds,
        );

        if (cachedPercentages) {
          const dominantSentiment =
            getDominantSentimentLabel(cachedPercentages);

          return {
            ...journal,
            mood: dominantSentiment,
            dominantSentiment,
            moodClass: getMoodClass(dominantSentiment),
            dotClass: getMoodDotClass(dominantSentiment),
          };
        }

        console.warn(
          `Sentiment percentages unavailable for journal ${journal.sentimentJournalId}:`,
          error,
        );
        return journal;
      }
    }),
  );

  return enriched;
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
  return parseJournalTimestamp(value);
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

function getMoodClass(mood: string) {
  const value = mood.toLowerCase();

  if (value.includes("positive")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-300";
  }
  if (value.includes("low")) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-300";
  }
  if (value.includes("stressed")) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300";
  }
  if (value.includes("negative") || value.includes("low")) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-300";
  }
  if (value.includes("neutral")) {
    return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }

  return "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function getMoodDotClass(mood: string) {
  const value = mood.toLowerCase();

  if (value.includes("positive")) return "bg-emerald-500";
  if (value.includes("negative") || value.includes("low")) return "bg-rose-500";
  if (value.includes("low")) return "bg-rose-500";
  if (value.includes("stressed")) return "bg-amber-500";
  if (value.includes("neutral")) return "bg-slate-400";

  return "bg-slate-400";
}

function getDominantSentimentLabel(
  percentages: JournalSentimentPercentagesResponse,
) {
  const scoreEntries = [
    {
      key: "positive",
      value: roundPercentage(percentages.percentages.positive),
      label: "Positive",
    },
    {
      key: "neutral",
      value: roundPercentage(percentages.percentages.neutral),
      label: "Neutral",
    },
    {
      key: "negative",
      value: roundPercentage(percentages.percentages.negative),
      label: "Negative",
    },
  ];

  scoreEntries.sort((left, right) => right.value - left.value);

  return scoreEntries[0]?.label ?? "Neutral";
}

function roundPercentage(value?: number) {
  return Number.isFinite(value) ? Math.round(value ?? 0) : 0;
}

async function fetchJournalSentimentPercentagesForArchive(
  journalIds: string[],
  userId: string,
) {
  let lastError: unknown = null;

  for (const journalId of journalIds) {
    try {
      return await getJournalSentimentPercentages(journalId, userId);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Sentiment percentages unavailable");
}

function readCachedJournalSentimentPercentages(
  userId: string,
  journalIds: string[],
) {
  if (typeof window === "undefined" || !userId.trim()) {
    return null;
  }

  for (const journalId of journalIds) {
    if (!journalId.trim()) {
      continue;
    }

    try {
      const rawValue = window.sessionStorage.getItem(
        `${JOURNAL_INSIGHTS_SESSION_CACHE_PREFIX}:${userId}:${journalId}`,
      );

      if (!rawValue) {
        continue;
      }

      const parsed = JSON.parse(rawValue) as {
        percentages?: JournalSentimentPercentagesResponse | null;
        status?: string;
      };

      if (parsed.status === "success" && parsed.percentages) {
        return parsed.percentages;
      }
    } catch (error) {
      console.warn(
        "Failed to read cached journal sentiment percentages:",
        error,
      );
    }
  }

  return null;
}

function readCachedArchiveSentimentPercentages(
  userId: string,
  journalIds: string[],
) {
  if (typeof window === "undefined" || !userId.trim()) {
    return null;
  }

  for (const journalId of journalIds) {
    if (!journalId.trim()) {
      continue;
    }

    try {
      const rawValue = window.sessionStorage.getItem(
        `${JOURNAL_ARCHIVE_SENTIMENT_CACHE_PREFIX}:${userId}:${journalId}`,
      );

      if (!rawValue) {
        continue;
      }

      const parsed = JSON.parse(rawValue) as {
        percentages?: JournalSentimentPercentagesResponse | null;
      };

      if (parsed.percentages) {
        return parsed.percentages;
      }
    } catch (error) {
      console.warn(
        "Failed to read cached archive sentiment percentages:",
        error,
      );
    }
  }

  return null;
}

function writeCachedArchiveSentimentPercentages(
  userId: string,
  journalId: string,
  percentages: JournalSentimentPercentagesResponse,
) {
  if (typeof window === "undefined" || !userId.trim() || !journalId.trim()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      `${JOURNAL_ARCHIVE_SENTIMENT_CACHE_PREFIX}:${userId}:${journalId}`,
      JSON.stringify({ percentages }),
    );
  } catch (error) {
    console.warn(
      "Failed to write cached archive sentiment percentages:",
      error,
    );
  }
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
  return formatJournalDateTime(timestampMs);
}

function formatCardDate(timestampMs: number | null) {
  return formatJournalDateTime(timestampMs);
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
