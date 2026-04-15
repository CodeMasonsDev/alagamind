"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Brain,
  Check,
  ChevronLeft,
  LoaderCircle,
  MoonStar,
  PanelRightOpen,
  RefreshCw,
  ScanSearch,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  type ApiSavedReframe,
  type ApiThought,
  type DetectedPattern,
  type DistortionBreakdown,
  type GeneratedReframe,
  fetchThoughtsByUsers,
  generateReframes,
  getInsights,
  getSaveReframe,
  saveGeneratedReframeThought,
} from "@/api/reframing";
import { useDashboardMetrics } from "@/components/providers/dashboard-metrics-provider";
import { getMe, SessionUser } from "@/api/auth/auth";

let cachedProfile: SessionUser | null = null;
let profilePromise: Promise<SessionUser> | null = null;

function getCachedMe(): Promise<SessionUser> {
  if (cachedProfile) return Promise.resolve(cachedProfile);
  if (!profilePromise) {
    profilePromise = getMe().then((user) => {
      cachedProfile = user;
      return user;
    }).catch((error) => {
      profilePromise = null;
      throw error;
    });
  }
  return profilePromise;
}

type Distortion = string;

type ReframeKind = "logical" | "compassionate" | "direct";

type Thought = {
  thought_Id: string;
  text: string;
  source: string;
  time: string;
  distortion: string;
  journalId: string;
  position: number;
};

type Reframe = {
  id: ReframeKind;
  title: string;
  tone: string;
  text: string;
};

type SavedReframe = {
  id: string;
  thoughtId: string;
  thoughtText: string;
  distortion: string;
  reframeType: string;
  reframeText: string;
  savedAt: string;
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

export default function MoodTrendsPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [thoughtsStatus, setThoughtsStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [thoughtsErrorMessage, setThoughtsErrorMessage] = useState<
    string | null
  >(null);
  const [reframeErrorMessage, setReframeErrorMessage] = useState<string | null>(
    null,
  );
  const [thoughtsRetryToken, setThoughtsRetryToken] = useState(0);

  const [profile, setProfile] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const currentUser = await getCachedMe();
        console.log("from reframing", currentUser.id);

        if (isMounted) setProfile(currentUser);
      } catch {
        if (isMounted) setProfile(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const defaultUserId = profile?.id;

  const { refreshFocusMomentum } = useDashboardMetrics();

  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>(
    [],
  );

  const [distortionBreakdowns, setDistortionBreakdown] =
    useState<DistortionBreakdown>({});

  const [selectedThoughtId, setSelectedThoughtId] = useState<string>("");
  const [generatedThoughtId, setGeneratedThoughtId] = useState<string | null>(
    null,
  );
  const [generatedReframes, setGeneratedReframes] = useState<Reframe[]>([]);
  const [savedReframes, setSavedReframes] = useState<SavedReframe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Cache: generated reframes keyed by thought ID
  const reframeCacheRef = useRef<Map<string, Reframe[]>>(new Map());

  // Flag: skip redundant initial loads on re-mounts within the same session
  const initialLoadDoneRef = useRef(false);

  const selectedThought =
    thoughts.find((thought) => thought.thought_Id === selectedThoughtId) ??
    null;
  const hasGeneratedSelection =
    generatedThoughtId === selectedThoughtId && generatedReframes.length > 0;

  useEffect(() => {
    if (!defaultUserId) {
      return;
    }

    // Skip fetch if data already loaded and this isn't a manual retry
    if (initialLoadDoneRef.current && thoughtsRetryToken === 0) {
      return;
    }

    let isCancelled = false;

    const loadPageData = async () => {
      setThoughtsStatus("loading");
      setThoughtsErrorMessage(null);

      const [thoughtsResult, savedReframesResult, insightsResult] =
        await Promise.allSettled([
          fetchThoughtsByUsers(defaultUserId),
          getSaveReframe(defaultUserId),
          getInsights(defaultUserId),
        ]);

      if (isCancelled) {
        return;
      }

      if (thoughtsResult.status === "fulfilled") {
        const mappedThoughts = thoughtsResult.value
          .map(mapApiThoughtToUi)
          .sort(compareThoughtsByRecency);
        setThoughts(mappedThoughts);
        setThoughtsStatus("success");
      } else {
        console.error("Failed to load thoughts:", thoughtsResult.reason);
        setThoughts([]);
        setThoughtsStatus("error");
        setThoughtsErrorMessage(
          "We could not load your thought list right now.",
        );
      }

      if (savedReframesResult.status === "fulfilled") {
        setSavedReframes(savedReframesResult.value.map(mapApiSaveThoughtToUi));
      } else {
        console.error(
          "Failed to load saved reframes:",
          savedReframesResult.reason,
        );
        setSavedReframes([]);
      }

      if (insightsResult.status === "fulfilled") {
        setDetectedPatterns(insightsResult.value.detected_patterns ?? []);
        setDistortionBreakdown(insightsResult.value.distortion_breakdown ?? {});
      } else {
        console.error(
          "Failed to load reframing insights:",
          insightsResult.reason,
        );
        setDetectedPatterns([]);
        setDistortionBreakdown({});
      }

      initialLoadDoneRef.current = true;
    };

    void loadPageData();

    return () => {
      isCancelled = true;
    };
  }, [defaultUserId, thoughtsRetryToken]);

  useEffect(() => {
    if (!thoughts.length) {
      setSelectedThoughtId("");
      return;
    }

    setSelectedThoughtId((current) =>
      thoughts.some((thought) => thought.thought_Id === current)
        ? current
        : thoughts[0].thought_Id,
    );
  }, [thoughts]);

  const headerMetrics = useMemo(() => {
    const uniqueThoughts = new Set(savedReframes.map((item) => item.thoughtId))
      .size;
    const completedToday = savedReframes.filter((item) =>
      isTodayTimestamp(item.savedAt),
    ).length;
    const dominantDistortion =
      getDominantDistortion(distortionBreakdowns) ??
      getDominantDistortionFromThoughts(thoughts);
    const insightWindow =
      detectedPatterns.find((pattern) => pattern.window?.trim())?.window ??
      "live";
    const fired =
      detectedPatterns.length > 0
        ? detectedPatterns.length
        : dominantDistortion
          ? 1
          : 0;

    return {
      completed: savedReframes.length,
      uniqueThoughts,
      completedToday,
      dominantDistortion,
      fired,
      insightWindow,
      insightTypes: getInsightTypesLabel(detectedPatterns, dominantDistortion),
    };
  }, [detectedPatterns, distortionBreakdowns, savedReframes, thoughts]);

  function mapApiThoughtToUi(item: ApiThought): Thought {
    return {
      thought_Id: String(item.thought_id),
      text: item.text,
      source: item.context_note || "Journal thought",
      time: item.created_at,
      distortion: item.distortion || "Unknown",
      journalId: item.journal_id,
      position: item.position,
    };
  }

  const handleThoughtSelect = useCallback((thoughtId: string) => {
    setSelectedThoughtId(thoughtId);
    setReframeErrorMessage(null);
    setIsGenerating(false);

    // Restore cached reframes for this thought instead of clearing
    const cached = reframeCacheRef.current.get(thoughtId);
    if (cached && cached.length > 0) {
      setGeneratedThoughtId(thoughtId);
      setGeneratedReframes(cached);
    } else {
      setGeneratedThoughtId(null);
      setGeneratedReframes([]);
    }
  }, []);
  async function handleGenerate() {
    if (!selectedThought) return;

    setIsGenerating(true);
    setGeneratedThoughtId(null);
    setGeneratedReframes([]);
    setReframeErrorMessage(null);

    try {
      const response = await generateReframes({
        thought_id: Number(selectedThought.thought_Id),
      });
      const nextReframes = Array.isArray(response.reframes)
        ? response.reframes.map(mapApiReframeToUi)
        : [];

      // Store in cache for this thought
      reframeCacheRef.current.set(
        String(response.thought_id),
        nextReframes,
      );

      setGeneratedThoughtId(String(response.thought_id));
      setGeneratedReframes(nextReframes);
    } catch (error) {
      console.error("Failed to generate reframes:", error);
      setGeneratedThoughtId(null);
      setGeneratedReframes([]);
      setReframeErrorMessage(
        "We could not generate reframes for this thought right now.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave(reframe: Reframe) {
    if (!selectedThought || !hasGeneratedSelection || !defaultUserId) return;
    const id = `${selectedThought.thought_Id}-${reframe.id}`;

    setSavedReframes((current) => {
      if (current.some((item) => item.id === id)) return current;
      return [
        {
          id,
          thoughtId: selectedThought.thought_Id,
          thoughtText: selectedThought.text,
          distortion: selectedThought.distortion,
          reframeType: reframe.id,
          reframeText: reframe.text,
          savedAt: new Date().toISOString(),
        },
        ...current,
      ];
    });

    const responseData = {
      user_id: defaultUserId,
      thought_id: Number(selectedThought.thought_Id),
      style: reframe.id,
      text: reframe.text,
      corrected_distortion: selectedThought.distortion,
    };

    try {
      await saveGeneratedReframeThought(responseData);
      await Promise.all([
        loadSavedReframes(defaultUserId),
        loadInsights(defaultUserId),
        refreshFocusMomentum(defaultUserId),
      ]);
    } catch (error) {
      console.error("Failed to save generated reframe:", error);
    }
  }

  function mapApiReframeToUi(item: GeneratedReframe): Reframe {
    return {
      id: item.id,
      title: item.title,
      tone: item.tone,
      text: item.text,
    };
  }

  function mapApiSaveThoughtToUi(item: ApiSavedReframe): SavedReframe {
    return {
      id: String(item.reframe_id),
      thoughtId: String(item.thought_id),
      thoughtText: item.thought_text,
      distortion: item.distortion,
      reframeType: item.style,
      reframeText: item.text,
      savedAt: item.created_at,
    };
  }

  async function loadSavedReframes(userId: string) {
    try {
      const items = await getSaveReframe(userId);
      setSavedReframes(items.map(mapApiSaveThoughtToUi));
    } catch (error) {
      console.error("Failed to load saved reframes:", error);
      setSavedReframes([]);
    }
  }

  async function loadInsights(userId: string) {
    try {
      const response = await getInsights(userId);
      setDetectedPatterns(response.detected_patterns ?? []);
      setDistortionBreakdown(response.distortion_breakdown ?? {});
    } catch (error) {
      console.error("Failed to load reframing insights:", error);
      setDetectedPatterns([]);
      setDistortionBreakdown({});
    }
  }

  function isSaved(type: ReframeKind) {
    return savedReframes.some(
      (item) =>
        item.thoughtId === selectedThoughtId && item.reframeType === type,
    );
  }

  return (
    <div className="min-h-full w-full bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]  p-3">
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <header className="overflow-hidden border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Reframing Lab
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => setIsInsightsOpen(true)}
                className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <PanelRightOpen className="h-4 w-4 text-violet-700" />
                View Pattern Insights
              </button>
            </div>
          </div>

          <div className="grid border-t border-slate-200 sm:grid-cols-3">
            <TopMetric
              label="Reframes Completed"
              value={String(headerMetrics.completed)}
              detail={
                headerMetrics.completed > 0
                  ? `Across ${headerMetrics.uniqueThoughts} unique thoughts`
                  : "Saved reframes will appear here after you choose a thought and keep one of the generated options."
              }
              chip={`+${headerMetrics.completedToday} today`}
            />
            <TopMetric
              label="Dominant Distortion"
              value={headerMetrics.dominantDistortion?.label ?? "No data yet"}
              detail={
                headerMetrics.dominantDistortion
                  ? `Present in ${formatPercent(headerMetrics.dominantDistortion.value)} of entries`
                  : thoughts.length > 0
                    ? "Thoughts are loaded, but no dominant distortion is strong enough to summarize yet."
                    : "Dominant distortion will appear after journal thoughts are analyzed."
              }
            />
            <TopMetric
              label="Pattern Insights Fired"
              value={String(headerMetrics.fired)}
              detail={
                headerMetrics.fired > 0
                  ? headerMetrics.insightTypes
                  : "Pattern insights will appear here after saved reframes create enough signal."
              }
              chip={titleCase(headerMetrics.insightWindow)}
            />
          </div>
        </header>

        <div className="flex flex-col gap-4 lg:flex-row">
          <section className="w-full lg:w-[50%] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <SectionTitle
                eyebrow="Step 1 - Select a thought"
                title="Pick the thought you want to rework"
                description="Keep the selection and generation flow on the left rail."
              />
            </div>

            <div className="space-y-3 px-5 py-5 sm:px-6 overflow-auto h-[250px]">
              {thoughtsStatus === "loading" ? (
                <ThoughtListLoadingState />
              ) : thoughtsStatus === "error" ? (
                <InlineRetryState
                  title="Thoughts unavailable"
                  message={
                    thoughtsErrorMessage ??
                    "We could not load thoughts for reframing."
                  }
                  onRetry={() => {
                    if (!defaultUserId) return;
                    setThoughtsStatus("idle");
                    setThoughtsErrorMessage(null);
                    setThoughts([]);
                    setSelectedThoughtId("");
                    setGeneratedThoughtId(null);
                    setGeneratedReframes([]);
                    setThoughtsRetryToken((current) => current + 1);
                  }}
                />
              ) : thoughts.length > 0 ? (
                thoughts.map((thought) => (
                  <ThoughtCard
                    key={thought.thought_Id}
                    thought={thought}
                    selected={thought.thought_Id === selectedThoughtId}
                    onSelect={() => handleThoughtSelect(thought.thought_Id)}
                  />
                ))
              ) : (
                <EmptyThoughtsState />
              )}
            </div>

            <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
              <SectionTitle
                eyebrow="Step 2 - Generate reframes"
                title="Generate three tones"
                description="Logical, compassionate, and direct versions appear in the right workspace."
              />

              <div className="mt-4 border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start gap-3">
                  <span className="bg-teal-50 p-2 text-teal-700">
                    <WandSparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedThought
                        ? `Ready to reframe: "${trimText(selectedThought.text, 56)}"`
                        : "Choose a thought to unlock generation"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {thoughts.length
                        ? "Showing all available thoughts returned by the backend."
                        : "Thoughts will appear here after journals are analyzed."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!selectedThought || isGenerating}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {isGenerating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Generating reframes
                    </>
                  ) : (
                    "Reframe this thought"
                  )}
                </button>

                {isGenerating ? <GenerationSkeleton /> : null}
                {reframeErrorMessage ? (
                  <div className="mt-4">
                    <InlineRetryState
                      title="Reframes unavailable"
                      message={reframeErrorMessage}
                      onRetry={() => void handleGenerate()}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="w-full lg:w-[50%] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <SectionTitle
                eyebrow="Step 3 - Choose a reframe to save"
                title="Save the reframe you want to keep"
                description="This workspace stays focused on the chosen thought and the three saved options."
              />
            </div>

            <div className="px-5 py-5 sm:px-6">
              {thoughts.length === 0 ? (
                <EmptyState
                  title="No reframes to save yet"
                  description="This workspace unlocks after a journal thought is detected on the left. Once thoughts are available, generate three tones here and save the version that feels most grounded."
                />
              ) : !selectedThought ? (
                <EmptyState
                  title="Pick a thought to begin"
                  description='Choose a thought from the left panel, then press "Reframe this thought" to generate the three saved options in this workspace.'
                />
              ) : isGenerating ? (
                <LoadingState />
              ) : !hasGeneratedSelection ? (
                <EmptyState
                  title="Generate reframes for the selected thought"
                  description='The selected thought is ready. Press "Reframe this thought" to create logical, compassionate, and direct versions here.'
                />
              ) : (
                <div className="space-y-5">
                  <div className="border border-slate-200 bg-slate-50/70 p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                      Selected original thought
                    </p>
                    <p className="mt-3 text-2xl font-medium tracking-tight text-slate-900">
                      {`"${selectedThought.text}"`}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <InfoPill>{selectedThought.source}</InfoPill>
                      <InfoPill>
                        {formatExactDateTime(selectedThought.time)}
                      </InfoPill>
                      <DistortionBadge label={selectedThought.distortion} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {generatedReframes.map((reframe) => (
                      <ReframeCard
                        key={reframe.id}
                        reframe={reframe}
                        saved={isSaved(reframe.id)}
                        onSave={() => handleSave(reframe)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <InsightsDrawer
        open={isInsightsOpen}
        savedReframes={savedReframes}
        detectedPattern={detectedPatterns}
        distortionBreakdowns={distortionBreakdowns}
        onClose={() => setIsInsightsOpen(false)}
      />
    </div>
  );
}

function TopMetric({
  label,
  value,
  detail,
  chip,
}: {
  label: string;
  value: string;
  detail: string;
  chip?: string;
}) {
  return (
    <div className="border-slate-200 px-5 py-4 sm:px-6 sm:[&:not(:last-child)]:border-r">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        {chip ? (
          <span className="bg-teal-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-teal-700">
            {chip}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ThoughtCard({
  thought,
  selected,
  onSelect,
}: {
  thought: Thought;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border p-4 text-left transition-all ${
        selected
          ? "border-teal-400 bg-teal-50/80 shadow-[0_14px_34px_-28px_rgba(13,148,136,0.45)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-[75%] text-xl leading-relaxed text-slate-950">
          {`"${thought.text}"`}
        </p>
        <DistortionBadge label={thought.distortion} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>{formatExactDateTime(thought.time)}</span>
        <span>{thought.source}</span>
      </div>
    </button>
  );
}

function ReframeCard({
  reframe,
  saved,
  onSave,
}: {
  reframe: Reframe;
  saved: boolean;
  onSave: () => void;
}) {
  const palette =
    reframe.id === "logical"
      ? {
          shell: "border-violet-100 bg-violet-50/40",
          heading: "text-violet-700",
          badge: "border-violet-100 bg-white text-violet-700",
          button: "bg-violet-600 text-white hover:bg-violet-700",
          savedButton: "bg-violet-100 text-violet-700",
        }
      : reframe.id === "compassionate"
        ? {
            shell: "border-pink-100 bg-pink-50/45",
            heading: "text-pink-700",
            badge: "border-pink-100 bg-white text-pink-700",
            button: "bg-pink-600 text-white hover:bg-pink-700",
            savedButton: "bg-pink-100 text-pink-700",
          }
        : {
            shell: "border-orange-100 bg-orange-50/45",
            heading: "text-orange-700",
            badge: "border-orange-100 bg-white text-orange-700",
            button: "bg-orange-500 text-white hover:bg-orange-600",
            savedButton: "bg-orange-100 text-orange-700",
          };

  return (
    <article
      className={`flex min-h-[320px] flex-col border p-5 ${palette.shell}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[11px] font-medium uppercase tracking-[0.22em] ${palette.heading}`}
          >
            {reframe.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {reframe.tone}
          </p>
        </div>
        <span
          className={`border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${palette.badge}`}
        >
          {saved ? "Saved" : "Ready"}
        </span>
      </div>

      <p className="mt-6 flex-1 text-[15px] leading-9 text-slate-800">
        {reframe.text}
      </p>

      <button
        type="button"
        onClick={onSave}
        disabled={saved}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
          saved ? `${palette.savedButton} cursor-default` : palette.button
        }`}
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved
          </>
        ) : (
          "Save reframe"
        )}
      </button>
    </article>
  );
}

function InsightsDrawer({
  open,
  savedReframes,
  detectedPattern,
  distortionBreakdowns,
  onClose,
}: {
  open: boolean;
  savedReframes: SavedReframe[];
  detectedPattern: DetectedPattern[];
  distortionBreakdowns: DistortionBreakdown;
  onClose: () => void;
}) {
  const items = Object.entries(distortionBreakdowns)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => normalizePercent(b.value) - normalizePercent(a.value));
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/15 transition-opacity ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] transform flex-col border-l border-slate-200 bg-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)] transition-transform duration-300 sm:w-[520px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Pattern Insights
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Updates live as you save reframes
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              This drawer comes from the right and hovers over the workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Close
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Live feed
            </p>
            {savedReframes.length > 0 ? (
              <div className="mt-3 space-y-2.5 overflow-y-auto h-[150px]">
                {savedReframes.map((item, index) => (
                  <SavedFeedItem key={index} item={item} />
                ))}
              </div>
            ) : (
              <DrawerEmptyState message="No reframes have been saved yet. Save a generated reframe to start the live feed." />
            )}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Detected patterns
            </p>
            {detectedPattern.length > 0 ? (
              <div className="mt-3 space-y-3">
                {detectedPattern.map((pattern, index) => (
                  <PatternCard key={index} pattern={pattern} />
                ))}
              </div>
            ) : (
              <DrawerEmptyState message="No behavioral patterns are available yet. They will appear once reframes accumulate enough trend data." />
            )}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Distortion breakdown
            </p>
            {items.length > 0 ? (
              <div className="mt-1">
                <div className="space-y-2">
                  {items.map((item) => (
                    <DistortionRow
                      key={item.label}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <DrawerEmptyState message="No distortion summary is available yet. Save reframes first so the drawer can summarize recurring thinking patterns." />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function DistortionRow({ label, value }: { label: string; value: number }) {
  const barColors = [
    "bg-violet-500",
    "bg-sky-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-indigo-500",
  ];

  const barClass =
    barColors[
      Array.from(label).reduce((total, char) => total + char.charCodeAt(0), 0) %
        barColors.length
    ];

  return (
    <div>
      <div className="flex items-center justify-between ">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <span className="text-sm font-semibold text-slate-500">
          {formatPercent(value)}
        </span>
      </div>

      <div className="mt-1 h-1.5 w-full bg-slate-100">
        <div
          className={`h-full ${barClass}`}
          style={{ width: `${normalizePercent(value)}%` }}
        />
      </div>
    </div>
  );
}

function SavedFeedItem({ item }: { item: SavedReframe }) {
  const badge =
    item.reframeType === "logical"
      ? "text-violet-700"
      : item.reframeType === "compassionate"
        ? "text-pink-700"
        : "text-orange-700";

  return (
    <div className="bg-slate-50 px-4 py-3">
      <p className="text-sm leading-relaxed text-slate-700">
        {'Saved: "'}
        {trimText(item.thoughtText, 30)}
        {'" - '}
        <span className={badge}>{titleCase(item.reframeType)} reframe</span>
        {" - "}
        {formatExactDateTime(item.savedAt)}
      </p>
    </div>
  );
}

function PatternCard({ pattern }: { pattern: DetectedPattern }) {
  const percent = Math.round(normalizePercent(pattern.share ?? 0));

  const Icon =
    pattern.type === "time"
      ? MoonStar
      : pattern.type === "topic"
        ? ScanSearch
        : Sparkles;

  const iconWrapClass =
    pattern.type === "time"
      ? "bg-sky-50 text-sky-500"
      : pattern.type === "topic"
        ? "bg-orange-50 text-orange-500"
        : "bg-violet-50 text-violet-500";

  const barClass =
    pattern.type === "time"
      ? "bg-sky-500"
      : pattern.type === "topic"
        ? "bg-orange-500"
        : "bg-violet-500";

  const subtitle =
    pattern.type === "time"
      ? `Time signal - ${pattern.count} entries detected${pattern.window ? ` • ${pattern.window}` : ""}`
      : pattern.type === "topic"
        ? `Topic signal - keywords: ${formatKeywords(pattern.keywords)}`
        : `${pattern.severity ? `${capitalize(pattern.severity)} pattern` : "Pattern"} - ${pattern.count} entries analyzed`;

  return (
    <article className="border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center ${iconWrapClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {pattern.title}
              </p>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-slate-500">
              {percent}%
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full bg-slate-100">
            <div
              className={`h-full ${barClass}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-white text-slate-400 shadow-sm">
        <Brain className="h-6 w-6" />
      </div>
      <p className="mx-auto mt-5 max-w-md text-lg font-semibold leading-relaxed text-slate-800">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptyThoughtsState() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
      <div className="max-w-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-white text-slate-400 shadow-sm">
          <WandSparkles className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xl font-semibold text-slate-800">
          No thoughts are ready for reframing yet
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          This panel fills after journal analysis detects thoughts worth
          reframing. Write or analyze a journal entry first, then return here to
          generate logical, compassionate, and direct alternatives.
        </p>
      </div>
    </div>
  );
}

function DrawerEmptyState({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5">
      <p className="text-sm leading-7 text-slate-500">{message}</p>
    </div>
  );
}

function ThoughtListLoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-slate-200 bg-white p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-4/5 bg-slate-100" />
            <div className="h-5 w-3/5 bg-slate-100" />
            <div className="flex gap-3">
              <div className="h-4 w-28 bg-slate-100" />
              <div className="h-4 w-24 bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InlineRetryState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="border border-rose-200 bg-rose-50 px-4 py-4 text-rose-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 border border-rose-200 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-700 transition-colors hover:bg-rose-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="border border-slate-200 bg-slate-50/70 p-5">
      <div className="inline-flex items-center gap-2 border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        Generating reframes
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border border-slate-200 bg-white p-5">
            <div className="animate-pulse space-y-4">
              <div className="h-3 w-24 bg-slate-200" />
              <div className="h-3 w-32 bg-slate-100" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-100" />
                <div className="h-3 bg-slate-100" />
                <div className="h-3 w-4/5 bg-slate-100" />
              </div>
              <div className="h-11 bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenerationSkeleton() {
  return (
    <div className="mt-4 border border-slate-200 bg-white p-4">
      <div className="animate-pulse space-y-2">
        <div className="h-2.5 w-24 bg-slate-200" />
        <div className="h-2.5 bg-slate-100" />
        <div className="h-2.5 w-4/5 bg-slate-100" />
      </div>
    </div>
  );
}

function DistortionBadge({ label }: { label: Distortion }) {
  return (
    <span className="border border-violet-100 bg-violet-50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-violet-700">
      {label}
    </span>
  );
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500">
      {children}
    </span>
  );
}

function trimText(value: string, max: number) {
  return value?.length <= max ? value : `${value?.slice(0, max)?.trimEnd()}...`;
}

function titleCase(value: string) {
  return value?.charAt(0)?.toUpperCase() + value?.slice(1);
}

function normalizePercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

function formatPercent(value: number) {
  return `${Math.round(normalizePercent(value))}%`;
}

function parseApiDate(value?: string | null) {
  if (!value) return null;

  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatExactDateTime(value?: string | null) {
  const date = parseApiDate(value);
  if (!date) return "Unknown time";
  return DATE_TIME_FORMATTER.format(date);
}

function isTodayTimestamp(value?: string | null) {
  const date = parseApiDate(value);
  if (!date) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function compareThoughtsByRecency(left: Thought, right: Thought) {
  const leftTimestamp = parseApiDate(left.time)?.getTime() ?? 0;
  const rightTimestamp = parseApiDate(right.time)?.getTime() ?? 0;

  if (rightTimestamp !== leftTimestamp) {
    return rightTimestamp - leftTimestamp;
  }

  return left.position - right.position;
}

function getDominantDistortion(distortionBreakdowns: DistortionBreakdown) {
  const items = Object.entries(distortionBreakdowns)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => normalizePercent(b[1]) - normalizePercent(a[1]));

  if (!items.length) return null;

  const [label, value] = items[0];
  return { label, value };
}

function getInsightTypesLabel(
  patterns: DetectedPattern[],
  dominantDistortion?: { label: string; value: number } | null,
) {
  const types = Array.from(
    new Set(
      patterns
        .map((pattern) => pattern.type?.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  return types.length
    ? `${types.join(", ")} signals`
    : dominantDistortion
      ? "Distortion signals detected"
      : "No time, topic, or distortion signals yet";
}

function getDominantDistortionFromThoughts(thoughts: Thought[]) {
  const counts = new Map<string, number>();

  for (const thought of thoughts) {
    const label = thought.distortion?.trim();
    if (!label) {
      continue;
    }

    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort(
    (left, right) => right[1] - left[1],
  );
  if (!sorted.length) {
    return null;
  }

  const [label, count] = sorted[0];
  const total = thoughts.length || 1;

  return {
    label,
    value: (count / total) * 100,
  };
}

function formatKeywords(keywords: DetectedPattern["keywords"]) {
  if (Array.isArray(keywords)) {
    return keywords.length ? keywords.join(", ") : "None";
  }

  return keywords?.trim() || "None";
}
