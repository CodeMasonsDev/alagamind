"use client";
import JournalPaper from "@/components/journals/journal-paper";
import LongMenu from "@/components/ui/long-menu";
import { DeleteJournalId } from "@/services/journals";
import { Lightbulb, Lock, Sparkles, Wind } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

// type MyJournalProps = {
//   params: Promise<{
//     user_id: string;
//     journal_id: string;
//   }>;
// };

type MyJournalProps = {
  params: Promise<{
    params: string[];
  }>;
};
export default function MyJournal({ params }: MyJournalProps) {
  const resolved = use(params);
  const router = useRouter();

  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const user_id = resolved.params[0];
  const journal_id = resolved.params[1];

  const HandlesDelete = async (userId: string, journalId: string) => {
    const res = await DeleteJournalId(userId, journalId);

    if (!res) console.log("unable to delete journal");

    console.log("Journal deleted successfully!");
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
        isInsightsOpen={isInsightsOpen}
        onToggleInsights={() => setIsInsightsOpen((current) => !current)}
        onDelete={() => HandlesDelete(user_id, journal_id)}
        onUpdate={() => handleUpdate(user_id, journal_id)}
      />
      <main className="flex w-full flex-1 flex-col lg:flex-row">
        <div
          className={`w-full transition-all duration-300 ${
            isInsightsOpen ? "lg:w-[72%]" : "lg:w-full"
          }`}
        >
          <JournalPaper
            user_id={user_id as string}
            journal_id={journal_id as string}
          />
        </div>

        {isInsightsOpen ? (
          <aside className="w-full border-t border-slate-200 bg-white lg:w-[28%] lg:border-l lg:border-t-0">
            <AiInsightsSidebar />
          </aside>
        ) : null}
      </main>
    </div>
  );
}

const TopBar = ({
  isInsightsOpen,
  onToggleInsights,
  onDelete,
  onUpdate,
}: {
  isInsightsOpen: boolean;
  onToggleInsights: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex  gap-2  w-full">
        <Link
          href={"/journals-reflections"}
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

        <div className="ml-5">
          <h3>Morninng Clarity</h3>
          <p className="text-[12px] text-gray-400">
            October 26, 2023 • 10:45 AM
          </p>
        </div>

        <div className="flex flex-1 justify-end m-2">
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
};

type InsightTheme = {
  label: string;
  className: string;
};

type SentimentMetric = {
  label: string;
  value: number;
  barClassName: string;
  valueClassName: string;
};

const INSIGHT_THEMES: InsightTheme[] = [
  {
    label: "Resilience",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  {
    label: "Positive Outlook",
    className: "border-blue-100 bg-blue-50 text-blue-700",
  },
  {
    label: "Growth Mindset",
    className: "border-violet-100 bg-violet-50 text-violet-700",
  },
];

const SENTIMENT_METRICS: SentimentMetric[] = [
  {
    label: "Positivity",
    value: 88,
    barClassName: "bg-teal-500",
    valueClassName: "text-teal-600",
  },
  {
    label: "Neutral",
    value: 72,
    barClassName: "bg-blue-500",
    valueClassName: "text-blue-600",
  },
  {
    label: "Negativity",
    value: 12,
    barClassName: "bg-slate-400",
    valueClassName: "text-slate-500",
  },
];

const SUGGESTED_REFRAME =
  '"You mentioned viewing feedback as data". This is a powerful cognitive technique. Consider how this might inform your next 30 days.';

function AiInsightsSidebar() {
  return (
    <section className="h-full px-6 py-7">
      <div className="space-y-6">
        <header className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
          <Sparkles size={13} className="text-teal-500" />
          AI Insights Sidebar
        </header>

        <section className="space-y-3 border-b border-slate-200 pb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Detected Themes
          </h2>

          <div className="flex flex-wrap gap-2">
            {INSIGHT_THEMES.map((theme) => (
              <span
                key={theme.label}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${theme.className}`}
              >
                {theme.label}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-b border-slate-200 pb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Sentiment Analysis
          </h2>

          <div className="space-y-3">
            {SENTIMENT_METRICS.map((metric) => (
              <InsightMeter key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
            <Lightbulb size={14} />
            Suggested Reframe
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {SUGGESTED_REFRAME}
          </p>
        </section>

        <section className="space-y-3 border-b border-slate-200 pb-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Recommended Protocol
          </h2>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <Wind size={14} />
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                4-7-8 Breathing
              </p>
              <p className="text-xs text-slate-500">
                To maintain current clarity
              </p>
            </div>
          </div>
        </section>

        <footer className="flex items-start gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          <Lock size={12} className="mt-0.5 shrink-0" />
          <p>
            Private entry. Your data is encrypted and remains under your control
            at all times.
          </p>
        </footer>
      </div>
    </section>
  );
}

function InsightMeter({
  label,
  value,
  barClassName,
  valueClassName,
}: SentimentMetric) {
  return (
    <article>
      <div className="mb-1 flex items-center justify-between text-sm">
        <p className="font-semibold text-slate-500">{label}</p>
        <p className={`text-sm font-bold ${valueClassName}`}>{value}%</p>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <span
          className={`block h-full rounded-full ${barClassName}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </article>
  );
}
