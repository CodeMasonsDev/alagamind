"use client";

import { useMemo, useState } from "react";
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
  X,
} from "lucide-react";

type Distortion =
  | "Catastrophizing"
  | "Mind reading"
  | "All-or-nothing"
  | "Should statements"
  | "Overgeneralization";

type ReframeKind = "logical" | "compassionate" | "direct";

type Thought = {
  id: string;
  text: string;
  source: string;
  time: string;
  distortion: Distortion;
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
  distortion: Distortion;
  reframeType: ReframeKind;
  reframeText: string;
  savedAt: string;
};

const thoughts: Thought[] = [
  {
    id: "presentation",
    text: "I'm going to fail this presentation.",
    source: "Nervous about work",
    time: "Today - 10:42 AM",
    distortion: "Catastrophizing",
  },
  {
    id: "manager",
    text: "My manager must think I'm incompetent after that meeting.",
    source: "Bad day at work",
    time: "Yesterday - 11:15 PM",
    distortion: "Mind reading",
  },
  {
    id: "perfect",
    text: "I can't handle any of this unless everything is perfect.",
    source: "Feeling overwhelmed",
    time: "Mar 16 - 8:30 PM",
    distortion: "All-or-nothing",
  },
  {
    id: "behind",
    text: "I should be further along by now.",
    source: "Comparing myself again",
    time: "Mar 15 - 9:10 PM",
    distortion: "Should statements",
  },
];

const reframeMap: Record<string, Reframe[]> = {
  presentation: [
    {
      id: "logical",
      title: "Logical",
      tone: "evidence-based correction",
      text: "One presentation is not a verdict on my ability. I prepared, I know the material, and anxiety is not proof that I will fail.",
    },
    {
      id: "compassionate",
      title: "Compassionate",
      tone: "validates then steadies",
      text: "It makes sense that I feel pressure. I can be nervous and still do this well enough, one slide at a time.",
    },
    {
      id: "direct",
      title: "Direct",
      tone: "firm reality check",
      text: "This is your brain predicting disaster, not reporting facts. Stop calling discomfort failure and focus on the next clear point.",
    },
  ],
  manager: [
    {
      id: "logical",
      title: "Logical",
      tone: "evidence-based correction",
      text: "Questions in a meeting usually mean clarification, not condemnation. I do not have evidence that one meeting erased my competence.",
    },
    {
      id: "compassionate",
      title: "Compassionate",
      tone: "validates then steadies",
      text: "That meeting activated my fear, so my mind is filling in the blanks harshly. I can offer myself more fairness than my anxiety is offering me.",
    },
    {
      id: "direct",
      title: "Direct",
      tone: "firm reality check",
      text: "Mind reading is not insight. Until someone says there is a problem, stop treating your worst guess like confirmed truth.",
    },
  ],
  perfect: [
    {
      id: "logical",
      title: "Logical",
      tone: "evidence-based correction",
      text: "I do not need perfect conditions to cope. I have handled unfinished and messy situations before, and progress still counts when it is imperfect.",
    },
    {
      id: "compassionate",
      title: "Compassionate",
      tone: "validates then steadies",
      text: "Feeling overwhelmed can make everything feel extreme. I can lower the bar, do one manageable piece, and still be taking myself seriously.",
    },
    {
      id: "direct",
      title: "Direct",
      tone: "firm reality check",
      text: "Perfection is not your entry ticket to functioning. That standard is making the problem bigger and blocking the next useful move.",
    },
  ],
  behind: [
    {
      id: "logical",
      title: "Logical",
      tone: "evidence-based correction",
      text: "'Should' is a comparison to an imagined standard. Other people's timelines are not visible to me, and my worth is not measured by borrowed pacing.",
    },
    {
      id: "compassionate",
      title: "Compassionate",
      tone: "validates then steadies",
      text: "It hurts to feel behind. I can admit that feeling without turning it into proof that I am failing my life.",
    },
    {
      id: "direct",
      title: "Direct",
      tone: "firm reality check",
      text: "This is comparison dressed up as a rule. Drop the fake deadline and return to the next real step that is actually yours.",
    },
  ],
};

const patternCards = [
  {
    id: "stakes",
    title: "You catastrophize before high-stakes events",
    subtitle: "Dominant pattern - 30 entries analyzed",
    percent: 70,
    icon: Sparkles,
    shell: "bg-violet-50 text-violet-700",
    bar: "bg-violet-500",
  },
  {
    id: "late-night",
    title: "Negative thoughts spike after 10 PM",
    subtitle: "Time signal - 18 of 30 entries at night",
    percent: 60,
    icon: MoonStar,
    shell: "bg-sky-50 text-sky-700",
    bar: "bg-sky-500",
  },
  {
    id: "work",
    title: "Work stress dominates your entries",
    subtitle: "Topic signal - keywords: deadline, manager",
    percent: 40,
    icon: ScanSearch,
    shell: "bg-orange-50 text-orange-700",
    bar: "bg-orange-500",
  },
] as const;

const baselineBreakdown = [
  { label: "Catastrophizing", value: 70, color: "bg-violet-500" },
  { label: "Mind reading", value: 40, color: "bg-sky-500" },
  { label: "All-or-nothing", value: 25, color: "bg-pink-500" },
  { label: "Overgeneralizing", value: 15, color: "bg-orange-500" },
] as const;

export default function MoodTrendsPage() {
  const [selectedThoughtId, setSelectedThoughtId] = useState<string>(
    thoughts[0]?.id ?? "",
  );
  const [generatedThoughtId, setGeneratedThoughtId] = useState<string | null>(
    null,
  );
  const [generatedReframes, setGeneratedReframes] = useState<Reframe[]>([]);
  const [savedReframes, setSavedReframes] = useState<SavedReframe[]>([
    {
      id: "seed-1",
      thoughtId: "seed-a",
      thoughtText: "I always mess up under pressure",
      distortion: "Catastrophizing",
      reframeType: "compassionate",
      reframeText:
        "Pressure makes me tense, but it does not erase my ability to recover and continue.",
      savedAt: "Mar 12",
    },
    {
      id: "seed-2",
      thoughtId: "seed-b",
      thoughtText: "Nobody respects my opinion in meetings",
      distortion: "Mind reading",
      reframeType: "direct",
      reframeText:
        "That is a conclusion, not evidence. I need to separate silence from rejection.",
      savedAt: "Mar 14",
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const selectedThought =
    thoughts.find((thought) => thought.id === selectedThoughtId) ?? null;
  const hasGeneratedSelection =
    generatedThoughtId === selectedThoughtId && generatedReframes.length > 0;

  const stats = useMemo(() => {
    const uniqueThoughts = new Set(savedReframes.map((item) => item.thoughtId))
      .size;
    return {
      completed: savedReframes.length + 22,
      uniqueThoughts: uniqueThoughts + 16,
      fired: Math.max(3, Math.min(9, savedReframes.length + 1)),
    };
  }, [savedReframes]);

  const distortionBreakdown = useMemo(() => {
    const counts = {
      Catastrophizing: baselineBreakdown[0].value,
      "Mind reading": baselineBreakdown[1].value,
      "All-or-nothing": baselineBreakdown[2].value,
      Overgeneralizing: baselineBreakdown[3].value,
    };

    for (const saved of savedReframes) {
      if (saved.distortion === "Catastrophizing") counts.Catastrophizing += 2;
      if (saved.distortion === "Mind reading") counts["Mind reading"] += 2;
      if (saved.distortion === "All-or-nothing") counts["All-or-nothing"] += 2;
      if (saved.distortion === "Overgeneralization")
        counts.Overgeneralizing += 2;
      if (saved.distortion === "Should statements")
        counts.Overgeneralizing += 1;
    }

    return [
      {
        label: "Catastrophizing",
        value: Math.min(counts.Catastrophizing, 95),
        color: "bg-violet-500",
      },
      {
        label: "Mind reading",
        value: Math.min(counts["Mind reading"], 95),
        color: "bg-sky-500",
      },
      {
        label: "All-or-nothing",
        value: Math.min(counts["All-or-nothing"], 95),
        color: "bg-pink-500",
      },
      {
        label: "Overgeneralizing",
        value: Math.min(counts.Overgeneralizing, 95),
        color: "bg-orange-500",
      },
    ];
  }, [savedReframes]);

  function handleThoughtSelect(thoughtId: string) {
    setSelectedThoughtId(thoughtId);
    setGeneratedThoughtId(null);
    setGeneratedReframes([]);
    setIsGenerating(false);
  }

  function handleGenerate() {
    if (!selectedThought) return;
    setIsGenerating(true);
    setGeneratedThoughtId(null);
    setGeneratedReframes([]);

    window.setTimeout(() => {
      setGeneratedThoughtId(selectedThought.id);
      setGeneratedReframes(reframeMap[selectedThought.id] ?? []);
      setIsGenerating(false);
    }, 1200);
  }

  function handleSave(reframe: Reframe) {
    if (!selectedThought || !hasGeneratedSelection) return;
    const id = `${selectedThought.id}-${reframe.id}`;

    setSavedReframes((current) => {
      if (current.some((item) => item.id === id)) return current;
      return [
        {
          id,
          thoughtId: selectedThought.id,
          thoughtText: selectedThought.text,
          distortion: selectedThought.distortion,
          reframeType: reframe.id,
          reframeText: reframe.text,
          savedAt: "Just now",
        },
        ...current,
      ];
    });
  }

  function isSaved(type: ReframeKind) {
    return savedReframes.some(
      (item) =>
        item.thoughtId === selectedThoughtId && item.reframeType === type,
    );
  }

  return (
    <div className="min-h-full w-full bg-[#fbfcfc]  ">
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
              value={String(stats.completed)}
              detail={`Across ${stats.uniqueThoughts} unique thoughts`}
              chip="+3 today"
            />
            <TopMetric
              label="Dominant Distortion"
              value="Catastrophizing"
              detail="Present in 70% of entries"
            />
            <TopMetric
              label="Pattern Insights Fired"
              value={String(stats.fired)}
              detail="Time, topic, distortion signals"
              chip="this week"
            />
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <SectionTitle
                eyebrow="Step 1 - Select a thought"
                title="Pick the thought you want to rework"
                description="Keep the selection and generation flow on the left rail."
              />
            </div>

            <div className="space-y-3 px-5 py-5 sm:px-6">
              {thoughts.map((thought) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  selected={thought.id === selectedThoughtId}
                  onSelect={() => handleThoughtSelect(thought.id)}
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

          <section className="border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)]">
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
        patternCards={patternCards}
        distortionBreakdown={distortionBreakdown}
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
  patternCards,
  distortionBreakdown,
  onClose,
}: {
  open: boolean;
  savedReframes: SavedReframe[];
  patternCards: typeof patternCards;
  distortionBreakdown: Array<{ label: string; value: number; color: string }>;
  onClose: () => void;
}) {
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
            <div className="mt-3 space-y-2.5">
              {savedReframes.map((item) => (
                <SavedFeedItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Detected patterns
            </p>
            <div className="mt-3 space-y-3">
              {patternCards.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Distortion breakdown
            </p>
            <div className="mt-3 space-y-3">
              {distortionBreakdown.map((item) => (
                <DistortionBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
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

function PatternCard({ pattern }: { pattern: (typeof patternCards)[number] }) {
  const Icon = pattern.icon;

  return (
    <article className="border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`p-2 ${pattern.shell}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-relaxed text-slate-950">
              {pattern.title}
            </p>
            <span className="text-sm font-medium text-slate-600">
              {pattern.percent}%
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {pattern.subtitle}
          </p>
          <div className="mt-3 h-1.5 bg-slate-100">
            <div
              className={`h-full ${pattern.bar}`}
              style={{ width: `${pattern.percent}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
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
  return value.length <= max ? value : `${value.slice(0, max).trimEnd()}...`;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
