"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Brain,
  Check,
  ChevronLeft,
  LoaderCircle,
  MoonStar,
  PanelRightOpen,
  ScanSearch,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  fetchThoughtsByUsers,
  generateReframes,
  getDetectedPatterns,
  getDistortionBreakDown,
  getSaveReframe,
  saveGeneratedReframeThought,
} from "@/api/reframing";

type Distortion = string;

type ReframeKind = "logical" | "compassionate" | "direct";

type Thought = {
  thought_Id: string;
  text: string;
  source: string;
  time: string;
  distortion: string;
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

type ApiThought = {
  thought_id: number;
  text: string;
  distortion: string;
  confidence: number;
  position: number;
  created_at: string;
  context_note: string;
  journal_id: string;
};

type ApiSaveThought = {
  reframe_id: number;
  thought_id: number;
  thought_text: string;
  distortion: string;
  style: string;
  text: string;
  created_at: string;
};

type DetectedPattern = {
  type: string;
  title: string;
  share: number;
  count: number;
  severity: string | null;
  window: string | null;
  keywords: string[] | string | null;
};

type DistortionBreakdown = Record<string, number>;

export default function MoodTrendsPage() {
  const [thoughts, setThougts] = useState<Thought[]>([]);
  const defaultUserId = "7e9793a6-c652-4b3a-8bed-780c221ee33a";

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

  const selectedThought =
    thoughts.find((thought) => thought.thought_Id === selectedThoughtId) ??
    null;
  const hasGeneratedSelection =
    generatedThoughtId === selectedThoughtId && generatedReframes.length > 0;

  const headerMetrics = useMemo(() => {
    const uniqueThoughts = new Set(savedReframes.map((item) => item.thoughtId))
      .size;
    const completedToday = savedReframes.filter((item) =>
      isTodayLabel(item.savedAt),
    ).length;
    const dominantDistortion = getDominantDistortion(distortionBreakdowns);
    const insightWindow =
      detectedPatterns.find((pattern) => pattern.window?.trim())?.window ??
      "live";

    return {
      completed: savedReframes.length,
      uniqueThoughts,
      completedToday,
      dominantDistortion,
      fired: detectedPatterns.length,
      insightWindow,
      insightTypes: getInsightTypesLabel(detectedPatterns),
    };
  }, [detectedPatterns, distortionBreakdowns, savedReframes]);

  async function fetchDistortionBreakdown(user_id: string) {
    try {
      const res = await getDistortionBreakDown(user_id);
      if (res) {
        console.log("distortions:", res);
        setDistortionBreakdown(res);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchDetectedPatterns(user_id: string) {
    try {
      const res = await getDetectedPatterns(user_id);
      if (res) {
        console.log("patterns:", res);
        setDetectedPatterns(res);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchDetectedPatterns(defaultUserId);
    fetchDistortionBreakdown(defaultUserId);
  }, []);

  function mapApiThoughtToUi(item: ApiThought): Thought {
    return {
      thought_Id: String(item.thought_id),
      text: item.text,
      source: item.context_note || "Journal thought",
      time: item.created_at || "Unknown time",
      distortion: item.distortion || "Unknown",
    };
  }

  async function fetchThoughts() {
    try {
      const res = await fetchThoughtsByUsers(defaultUserId);
      if (!res) {
        console.log("cant process request");
        setThougts([]);
        return;
      }
      console.log("thoughts:", res);

      const items: ApiThought[] = Array.isArray(res) ? res : [res];
      const mappedThoughts = items.map(mapApiThoughtToUi);
      setThougts(mappedThoughts);
      setSelectedThoughtId(
        (current) => current || mappedThoughts[0]?.thought_Id || "",
      );
    } catch (error) {
      console.log(error);
    }
  }
  async function generateThoughts(thought_id: number, text: string) {
    try {
      const res = await generateReframes({ thought_id, text });
      const generatedItems = Array.isArray(res) ? res : [];
      console.log("generated reframes", res);
      setGeneratedReframes(generatedItems);
      return generatedItems;
    } catch (error) {
      console.log("failed to fetch");
      return [];
    }
  }

  useEffect(() => {
    fetchThoughts();
  }, []);

  function handleThoughtSelect(thoughtId: string) {
    setSelectedThoughtId(thoughtId);
    setGeneratedThoughtId(null);
    setGeneratedReframes([]);
    setIsGenerating(false);
  }
  async function handleGenerate() {
    if (!selectedThought) return;

    setIsGenerating(true);
    setGeneratedThoughtId(null);
    setGeneratedReframes([]);

    console.log("generating reframing...");

    try {
      const res = await generateThoughts(
        Number(selectedThought.thought_Id),
        selectedThought.text,
      );

      console.log("res", res);

      setGeneratedThoughtId(selectedThought.thought_Id);
      setGeneratedReframes(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Failed to generate reframes:", error);
      setGeneratedReframes([]);
    } finally {
      setIsGenerating(false);
    }
  }
  async function handleSave(reframe: Reframe) {
    if (!selectedThought || !hasGeneratedSelection) return;
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
          savedAt: "Just now",
        },
        ...current,
      ];
    });

    const responseData = {
      user_id: defaultUserId,
      thought_id: Number(selectedThought.thought_Id),
      style: reframe.title.toLowerCase(),
      text: reframe.text,
      corrected_distortion: selectedThought.distortion,
    };

    const res = await saveGeneratedReframeThought(responseData);
    if (!res) {
      console.log("failed to fetch");
    } else {
      console.log("saved reframe:", responseData);
      await Promise.all([
        getSaveReframes(defaultUserId),
        fetchDetectedPatterns(defaultUserId),
        fetchDistortionBreakdown(defaultUserId),
      ]);
    }
  }

  function mapApiSaveThoughtToUi(item: ApiSaveThought): SavedReframe {
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

  async function getSaveReframes(user_id: string) {
    try {
      const res = await getSaveReframe(user_id);
      if (!res) {
        setSavedReframes([]);
        return;
      }
      console.log("save", res);

      const items: ApiSaveThought[] = Array.isArray(res) ? res : [res];
      const mappedThoughts = items.map(mapApiSaveThoughtToUi);

      setSavedReframes(mappedThoughts);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getSaveReframes(defaultUserId);
  }, []);

  function isSaved(type: ReframeKind) {
    return savedReframes.some(
      (item) =>
        item.thoughtId === selectedThoughtId && item.reframeType === type,
    );
  }

  return (
    <div className="min-h-full w-full bg-[#fbfcfc]  p-3">
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <header className="overflow-hidden border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Reframing Lab
              </h1>
              <span className="inline-flex items-center gap-2 border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-teal-700">
                <span className="h-1.5 w-1.5 bg-teal-500" />
                Neural engine active
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <p className="max-w-md text-sm leading-relaxed text-slate-500">
                Reframe a thought and watch your patterns update.
              </p>
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
                  : "No saved reframes yet"
              }
              chip={`+${headerMetrics.completedToday} today`}
            />
            <TopMetric
              label="Dominant Distortion"
              value={headerMetrics.dominantDistortion?.label ?? "No data yet"}
              detail={
                headerMetrics.dominantDistortion
                  ? `Present in ${formatPercent(headerMetrics.dominantDistortion.value)} of entries`
                  : "Waiting for distortion data"
              }
            />
            <TopMetric
              label="Pattern Insights Fired"
              value={String(headerMetrics.fired)}
              detail={headerMetrics.insightTypes}
              chip={titleCase(headerMetrics.insightWindow)}
            />
          </div>
        </header>

        <div className=" flex gap-4 ">
          <section className="w-[50%] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <SectionTitle
                eyebrow="Step 1 - Select a thought"
                title="Pick the thought you want to rework"
                description="Keep the selection and generation flow on the left rail."
              />
            </div>

            <div className="space-y-3 px-5 py-5 sm:px-6 overflow-auto h-[300px]">
              {thoughts.map((thought) => (
                <ThoughtCard
                  key={thought.thought_Id}
                  thought={thought}
                  selected={thought.thought_Id === selectedThoughtId}
                  onSelect={() => handleThoughtSelect(thought.thought_Id)}
                />
              ))}
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
                      Simulated AI behavior with local state only.
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
              </div>
            </div>
          </section>

          <section className="w-[50%] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <SectionTitle
                eyebrow="Step 3 - Choose a reframe to save"
                title="Save the reframe you want to keep"
                description="This workspace stays focused on the chosen thought and the three saved options."
              />
            </div>

            <div className="px-5 py-5 sm:px-6">
              {!selectedThought ? (
                <EmptyState
                  text={
                    'Pick a thought on the left and press "Reframe this thought" to begin.'
                  }
                />
              ) : isGenerating ? (
                <LoadingState />
              ) : !hasGeneratedSelection ? (
                <EmptyState
                  text={
                    'Pick a thought on the left and press "Reframe this thought" to begin.'
                  }
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
                      <InfoPill>{selectedThought.time}</InfoPill>
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
        <span>{thought.time}</span>
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
            <div className="mt-3 space-y-2.5 overflow-y-auto h-[150px]">
              {savedReframes.map((item, index) => (
                <SavedFeedItem key={index} item={item} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Detected patterns
            </p>
            <div className="mt-3 space-y-3">
              {detectedPattern.map((pattern, index) => (
                <PatternCard key={index} pattern={pattern} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Distortion breakdown
            </p>
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

  const barClass = barColors[Math.floor(Math.random() * barColors.length)];

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
        {item.savedAt}
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

function DistortionBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-white text-slate-400 shadow-sm">
        <Brain className="h-6 w-6" />
      </div>
      <p className="mx-auto mt-5 max-w-md text-lg font-medium leading-relaxed text-slate-700">
        {text}
      </p>
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

function isTodayLabel(value: string) {
  if (!value) return false;
  const normalizedValue = value.toLowerCase();
  if (normalizedValue.includes("today") || normalizedValue.includes("just now")) {
    return true;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function getDominantDistortion(distortionBreakdowns: DistortionBreakdown) {
  const items = Object.entries(distortionBreakdowns)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => normalizePercent(b[1]) - normalizePercent(a[1]));

  if (!items.length) return null;

  const [label, value] = items[0];
  return { label, value };
}

function getInsightTypesLabel(patterns: DetectedPattern[]) {
  const types = Array.from(
    new Set(
      patterns
        .map((pattern) => pattern.type?.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

  return types.length
    ? `${types.join(", ")} signals`
    : "No time, topic, or distortion signals yet";
}

function formatKeywords(keywords: DetectedPattern["keywords"]) {
  if (Array.isArray(keywords)) {
    return keywords.length ? keywords.join(", ") : "None";
  }

  return keywords?.trim() || "None";
}

