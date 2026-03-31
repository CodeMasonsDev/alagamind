"use client";

import { GetUserJournal } from "@/api/journal";
import {
  analyzeJournalSentiment,
  getJournalSentiment,
  getJournalSentimentPercentages,
  type JournalRecommendedProtocol,
  type JournalSentimentPercentagesResponse,
  type JournalSentimentResponse,
} from "@/api/journal-sentiment";
import type {
  HighlightableSentiment,
  JournalPaperEntry,
} from "@/components/journals/journal-paper";
import JournalPaper from "@/components/journals/journal-paper";
import LongMenu from "@/components/ui/long-menu";
import {
  formatJournalCalendarDate,
  formatJournalClockTime,
  parseJournalTimestamp,
} from "@/lib/journal-datetime";
import { DeleteJournalId } from "@/services/journals";
import {
  AlertCircle,
  Lightbulb,
  Lock,
  RefreshCw,
  Sparkles,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

type MyJournalProps = {
  params: Promise<{
    params: string[];
  }>;
};

type RawJournal = {
  id?: string;
  journalId?: string;
  title?: string;
  content?: string;
  createdAt?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
};

type JournalDetail = JournalPaperEntry & {
  id: string;
  createdAt: number | null;
};

type SentimentMetric = {
  label: string;
  sentimentKey: HighlightableSentiment;
  value: number;
  barClassName: string;
  valueClassName: string;
};

type InsightsState = {
  status: "idle" | "loading" | "success" | "error";
  percentages: JournalSentimentPercentagesResponse | null;
  sentiment: JournalSentimentResponse | null;
  errorMessage: string | null;
};

type InsightsCacheRecord = InsightsState & {
  cachedAt: number;
};

const EMPTY_INSIGHTS_STATE: InsightsState = {
  status: "idle",
  percentages: null,
  sentiment: null,
  errorMessage: null,
};

const INSIGHTS_CACHE_TTL_MS = 5 * 60 * 1000;

export default function MyJournal({ params }: MyJournalProps) {
  const resolved = use(params);
  const router = useRouter();

  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [journal, setJournal] = useState<JournalDetail | null>(null);
  const [isJournalLoading, setIsJournalLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] =
    useState<HighlightableSentiment | null>(null);
  const [insightsCache, setInsightsCache] = useState<
    Record<string, InsightsCacheRecord>
  >({});

  const user_id = resolved.params[0] ?? "";
  const journal_id = resolved.params[1] ?? "";

  useEffect(() => {
    if (!user_id || !journal_id) {
      setJournal(null);
      setIsJournalLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchJournal = async () => {
      try {
        setIsJournalLoading(true);
        const response = await GetUserJournal(user_id, journal_id);

        if (!isCancelled) {
          setJournal(normalizeJournalDetail(response, journal_id));
        }
      } catch (error) {
        console.error("Failed to fetch journal:", error);
        if (!isCancelled) {
          setJournal(null);
        }
      } finally {
        if (!isCancelled) {
          setIsJournalLoading(false);
        }
      }
    };

    void fetchJournal();

    return () => {
      isCancelled = true;
    };
  }, [journal_id, user_id]);

  useEffect(() => {
    setSelectedSentiment(null);
  }, [journal_id]);

  const handleDelete = async (userId: string, journalId: string) => {
    const response = await DeleteJournalId(userId, journalId);

    if (!response) {
      console.log("unable to delete journal");
      return;
    }

    router.push("/journals-reflections/archive");
  };

  const handleUpdate = (userId: string, journalId: string) => {
    const queryParams = new URLSearchParams({
      userId,
      journalId,
    });

    router.push(`/journals-reflections/write?${queryParams.toString()}`);
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <TopBar
        title={journal?.title}
        createdAt={journal?.createdAt ?? null}
        isLoading={isJournalLoading}
        isInsightsOpen={isInsightsOpen}
        onToggleInsights={() => setIsInsightsOpen((current) => !current)}
        onDelete={() => handleDelete(user_id, journal_id)}
        onUpdate={() => handleUpdate(user_id, journal_id)}
      />

      <main className="flex w-full flex-1 flex-col lg:flex-row">
        <div
          className={`w-full transition-all duration-300 ${
            isInsightsOpen ? "lg:w-[72%]" : "lg:w-full"
          }`}
        >
          <JournalPaper
            journal={journal}
            selectedSentiment={selectedSentiment}
            highlightedSegments={
              selectedSentiment && insightsCache[journal_id]?.sentiment?.segments
                ? insightsCache[journal_id].sentiment.segments
                : []
            }
          />
        </div>

        {isInsightsOpen ? (
          <aside className="w-full border-t border-slate-200 bg-white lg:w-[40%] lg:border-l lg:border-t-0">
            <AiInsightsSidebar
              userId={user_id}
              journalId={journal_id}
              journal={journal}
              selectedSentiment={selectedSentiment}
              onSelectedSentimentChange={setSelectedSentiment}
              cacheEntry={insightsCache[journal_id]}
              onCacheUpdate={(nextState) => {
                if (!journal_id) return;

                setInsightsCache((current) => ({
                  ...current,
                  [journal_id]: {
                    ...nextState,
                    cachedAt: Date.now(),
                  },
                }));
              }}
            />
          </aside>
        ) : null}
      </main>
    </div>
  );
}

function TopBar({
  title,
  createdAt,
  isLoading,
  isInsightsOpen,
  onToggleInsights,
  onDelete,
  onUpdate,
}: {
  title?: string;
  createdAt: number | null;
  isLoading: boolean;
  isInsightsOpen: boolean;
  onToggleInsights: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}) {
  const dateLabel = createdAt
    ? formatJournalCalendarDate(createdAt)
    : "Unknown date";
  const timeLabel = createdAt
    ? formatJournalClockTime(createdAt)
    : "Unknown time";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex w-full gap-2">
        <Link
          href="/journals-reflections/archive"
          className="flex items-center transition-colors hover:text-gray-900"
        >
          <svg
            className="mr-2 h-4 w-4"
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

        <div className="ml-5 min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">
            {isLoading ? "Loading journal..." : title || "Untitled Reflection"}
          </h3>
          <p className="text-[12px] text-gray-400">
            {isLoading
              ? "Fetching journal details"
              : `${dateLabel} at ${timeLabel}`}
          </p>
        </div>

        <div className="m-2 flex flex-1 justify-end">
          <LongMenu onDelete={onDelete} onUpdate={onUpdate} />
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleInsights}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
      >
        <Sparkles size={13} />
        {isInsightsOpen ? "Hide Insights" : "Open Insights"}
      </button>
    </header>
  );
}

function AiInsightsSidebar({
  userId,
  journalId,
  journal,
  selectedSentiment,
  onSelectedSentimentChange,
  cacheEntry,
  onCacheUpdate,
}: {
  userId: string;
  journalId: string;
  journal: JournalDetail | null;
  selectedSentiment: HighlightableSentiment | null;
  onSelectedSentimentChange: (value: HighlightableSentiment | null) => void;
  cacheEntry?: InsightsCacheRecord;
  onCacheUpdate: (nextState: InsightsState) => void;
}) {
  const [state, setState] = useState<InsightsState>(() =>
    getInitialInsightsState(cacheEntry),
  );
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!userId || !journalId || !journal) {
      return;
    }

    const cachedState = getValidCachedInsights(cacheEntry);
    if (cachedState && retryToken === 0) {
      return;
    }

    let isCancelled = false;

    const loadInsights = async () => {
      setState((current) => ({
        ...current,
        status: "loading",
        errorMessage: null,
      }));

      try {
        const result = await fetchJournalInsights({
          userId,
          journalId,
          journal,
        });

        if (!isCancelled) {
          const nextState = {
            status: "success",
            percentages: result.percentages,
            sentiment: result.sentiment,
            errorMessage: null,
          } satisfies InsightsState;

          setState(nextState);
          onCacheUpdate(nextState);
        }
      } catch (error) {
        console.error("Failed to load journal insights:", error);

        if (!isCancelled) {
          const nextState = {
            status: "error",
            percentages: null,
            sentiment: null,
            errorMessage:
              "We could not load sentiment insights for this journal right now.",
          } satisfies InsightsState;

          setState(nextState);
          onCacheUpdate(nextState);
        }
      }
    };

    void loadInsights();

    return () => {
      isCancelled = true;
    };
  }, [cacheEntry, journal, journalId, onCacheUpdate, retryToken, userId]);

  const metrics = buildSentimentMetrics(state.percentages);
  const segmentCount = state.sentiment?.segments.length ?? 0;
  const suggestedReframe =
    state.percentages?.suggested_reframe?.trim() ||
    "No reframe suggestion is available for this journal yet.";
  const recommendedProtocol = state.percentages?.recommended_protocol ?? null;

  return (
    <section className="h-full px-6 py-7 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:overflow-y-auto">
      <div className="space-y-6">
        <header className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
          <Sparkles size={13} className="text-teal-500" />
          AI Insights Sidebar
        </header>

        {state.status === "loading" ? <InsightsLoadingState /> : null}

        {state.status === "error" ? (
          <InsightsErrorState
            message={state.errorMessage}
            onRetry={() => {
              setState(EMPTY_INSIGHTS_STATE);
              setRetryToken((current) => current + 1);
            }}
          />
        ) : null}

        {state.status === "success" ? (
          <>
            <section className="space-y-4 border-b border-slate-200 pb-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Sentiment Analysis
                </h2>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {segmentCount} segments analyzed
                </p>
              </div>

              <div className="space-y-3">
                {metrics.map((metric) => (
                  <InsightMeter
                    key={metric.label}
                    {...metric}
                    isActive={selectedSentiment === metric.sentimentKey}
                    onClick={() =>
                      onSelectedSentimentChange(
                        selectedSentiment === metric.sentimentKey
                          ? null
                          : metric.sentimentKey,
                      )
                    }
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
                <Lightbulb size={14} />
                Suggested Reframe
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {suggestedReframe}
              </p>
            </section>

            <section className="space-y-3 border-b border-slate-200 pb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Recommended Protocol
              </h2>

              <RecommendedProtocolCard protocol={recommendedProtocol} />
            </section>
          </>
        ) : null}

        <footer className="flex items-start gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          <Lock size={12} className="mt-0.5 shrink-0" />
          <p>
            Private entry. Your data is safe and remains under your control at
            all times.
          </p>
        </footer>
      </div>
    </section>
  );
}

function InsightsLoadingState() {
  return (
    <section className="space-y-4">
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <div className="h-3 w-28 rounded bg-slate-100" />
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-10 rounded bg-slate-100" />
              </div>
              <div className="h-1.5 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="h-4 w-36 rounded bg-slate-100" />
        <div className="mt-3 space-y-2">
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 w-4/5 rounded bg-slate-100" />
        </div>
      </div>
    </section>
  );
}

function InsightsErrorState({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <div className="flex items-start gap-3">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Insights unavailable</p>
          <p className="mt-1 text-sm leading-relaxed">
            {message ?? "We could not load insights for this journal."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 transition-colors hover:bg-rose-100"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    </section>
  );
}

function RecommendedProtocolCard({
  protocol,
}: {
  protocol: JournalRecommendedProtocol | null;
}) {
  if (!protocol) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-500">
        No protocol recommendation is available yet.
      </div>
    );
  }

  const cardContent = (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-teal-100 hover:bg-teal-50/50">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
        <Wind size={16} />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700">{protocol.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {protocol.description}
        </p>
        {protocol.duration ? (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Duration: {protocol.duration}
          </p>
        ) : null}
        {protocol.reason ? (
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {protocol.reason}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (protocol.href) {
    return <Link href={protocol.href}>{cardContent}</Link>;
  }

  return cardContent;
}

function InsightMeter({
  label,
  sentimentKey,
  value,
  barClassName,
  valueClassName,
  isActive,
  onClick,
}: SentimentMetric & {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-xl border px-3 py-2 text-left transition-colors ${
        isActive
          ? "border-slate-300 bg-slate-50"
          : "border-transparent hover:border-slate-200 hover:bg-slate-50/70"
      }`}
      aria-pressed={isActive}
      aria-label={`Highlight ${sentimentKey} sections in journal`}
    >
      <div className="mb-1 flex items-center justify-between text-sm">
        <p className="font-semibold text-slate-500">{label}</p>
        <p className={`text-sm font-bold ${valueClassName}`}>{value}%</p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <span
          className={`block h-full rounded-full ${barClassName}`}
          style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
        />
      </div>
    </button>
  );
}

async function fetchJournalInsights({
  userId,
  journalId,
  journal,
}: {
  userId: string;
  journalId: string;
  journal: JournalDetail;
}) {
  try {
    const [percentages, sentiment] = await Promise.all([
      getJournalSentimentPercentages(journalId, userId),
      getJournalSentiment(journalId, userId),
    ]);

    return { percentages, sentiment };
  } catch (initialError) {
    if (!journal.content?.trim()) {
      throw initialError;
    }

    await analyzeJournalSentiment({
      user_id: userId,
      journal_id: journalId,
      content: journal.content,
      created_at: resolveCreatedAtIso(journal.createdAt),
    });

    const [percentages, sentiment] = await Promise.all([
      getJournalSentimentPercentages(journalId, userId),
      getJournalSentiment(journalId, userId),
    ]);

    return { percentages, sentiment };
  }
}

function buildSentimentMetrics(
  percentages: JournalSentimentPercentagesResponse | null,
): SentimentMetric[] {
  return [
    {
      label: "Positivity",
      sentimentKey: "positive",
      value: roundPercentage(percentages?.percentages.positive),
      barClassName: "bg-teal-500",
      valueClassName: "text-teal-600",
    },
    {
      label: "Neutral",
      sentimentKey: "neutral",
      value: roundPercentage(percentages?.percentages.neutral),
      barClassName: "bg-blue-500",
      valueClassName: "text-blue-600",
    },
    {
      label: "Negativity",
      sentimentKey: "negative",
      value: roundPercentage(percentages?.percentages.negative),
      barClassName: "bg-red-400",
      valueClassName: "text-slate-500",
    },
  ];
}

function roundPercentage(value?: number) {
  return Number.isFinite(value) ? Math.round(value ?? 0) : 0;
}

function normalizeJournalDetail(
  journal: RawJournal | null | undefined,
  fallbackJournalId: string,
): JournalDetail | null {
  if (!journal) {
    return null;
  }

  const title = String(journal.title ?? "").trim() || "Untitled Reflection";
  const content = String(journal.content ?? "");

  return {
    id: String(journal.id ?? journal.journalId ?? fallbackJournalId),
    title,
    content,
    createdAt: resolveJournalTimestamp(journal),
  };
}

function resolveJournalTimestamp(journal: RawJournal) {
  return (
    parseJournalTimestamp(journal.updatedAt) ??
    parseJournalTimestamp(journal.updated_at) ??
    parseJournalTimestamp(journal.createdAt) ??
    parseJournalTimestamp(journal.created_at)
  );
}

function resolveCreatedAtIso(createdAt: number | null) {
  return new Date(createdAt ?? Date.now()).toISOString();
}

function getInitialInsightsState(cacheEntry?: InsightsCacheRecord) {
  return getValidCachedInsights(cacheEntry) ?? EMPTY_INSIGHTS_STATE;
}

function getValidCachedInsights(cacheEntry?: InsightsCacheRecord) {
  if (!cacheEntry) {
    return null;
  }

  if (Date.now() - cacheEntry.cachedAt > INSIGHTS_CACHE_TTL_MS) {
    return null;
  }

  return {
    status: cacheEntry.status,
    percentages: cacheEntry.percentages,
    sentiment: cacheEntry.sentiment,
    errorMessage: cacheEntry.errorMessage,
  } satisfies InsightsState;
}
