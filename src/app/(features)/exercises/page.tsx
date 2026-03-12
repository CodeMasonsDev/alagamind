"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Clock3,
  Crosshair,
  Flame,
  HeartPulse,
  HelpCircle,
  Plus,
  Search,
  Shield,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";

type FeaturedProtocol = {
  title: string;
  description: string;
  duration: string;
  badge: string;
  icon: LucideIcon;
  featured?: boolean;
  href?: string;
};

type Protocol = {
  id: number;
  title: string;
  description: string;
  category: "CBT" | "DBT" | "Mindfulness" | "Regulation";
  focus: string;
  duration: number;
  icon: LucideIcon;
};

type FocusFilter = "All Focus" | "CBT" | "DBT" | "Mindfulness";
type DurationFilter =
  | "All Durations"
  | "Under 6 min"
  | "6 to 10 min"
  | "Over 10 min";

const featuredProtocols: FeaturedProtocol[] = [
  {
    title: "Box Breathing",
    description:
      "Vagal tone optimization and autonomic nervous system regulation.",
    duration: "4 MINUTES",
    badge: "98% Match",
    icon: Waves,
    featured: true,
    href: "/exercises/box-breathing/session",
  },
  {
    title: "Cognitive Reframing",
    description:
      "Identify and challenge cognitive distortions to reduce distress.",
    duration: "6 MINUTES",
    badge: "92% Match",
    icon: BrainCircuit,
    href: "/exercises/cognitive-reframing",
  },
  {
    title: "Grounding: 5-4-3-2-1",
    description: "Immediate sensory-based anxiety relief for acute regulation.",
    duration: "5 MINUTES",
    badge: "Acute Relief",
    icon: Crosshair,
    href: "/exercises/cognitive-reframing",
  },
];

const protocols: Protocol[] = [
  {
    id: 1,
    title: "Behavioral Activation",
    description:
      "Structured action planning to improve mood and restore forward momentum through measurable daily wins.",
    category: "CBT",
    focus: "Mood & Energy",
    duration: 15,
    icon: Activity,
  },
  {
    id: 2,
    title: "TIPP Skills",
    description:
      "Rapid distress tolerance sequence for immediate nervous system downshifting under high emotional load.",
    category: "DBT",
    focus: "Crisis Regulation",
    duration: 5,
    icon: Flame,
  },
  {
    id: 3,
    title: "Self-Compassion Letter",
    description:
      "Guided reflective writing protocol to reduce self-criticism and strengthen internal emotional safety.",
    category: "Mindfulness",
    focus: "Emotional Resilience",
    duration: 12,
    icon: HeartPulse,
  },
  {
    id: 4,
    title: "Anxiety De-escalation",
    description:
      "Somatic and breath pacing sequence designed to lower arousal and stabilize attention in real time.",
    category: "Regulation",
    focus: "Calm",
    duration: 8,
    icon: Waves,
  },
  {
    id: 5,
    title: "Mindful Worry Observation",
    description:
      "Observe repetitive thought patterns without fusion, then redirect to present-state sensory anchors.",
    category: "Mindfulness",
    focus: "Overthinking",
    duration: 10,
    icon: Sparkles,
  },
  {
    id: 6,
    title: "Positive Data Logging",
    description:
      "Evidence-based cognitive journaling to balance bias toward threat and reinforce adaptive interpretations.",
    category: "CBT",
    focus: "Perspective Shift",
    duration: 9,
    icon: BrainCircuit,
  },
  {
    id: 7,
    title: "Values-Aligned Micro Action",
    description:
      "Select one small committed action linked to personal values to build confidence and direction.",
    category: "DBT",
    focus: "Behavioral Clarity",
    duration: 7,
    icon: Crosshair,
  },
];

const focusFilters: FocusFilter[] = ["All Focus", "CBT", "DBT", "Mindfulness"];
const durationFilters: DurationFilter[] = [
  "All Durations",
  "Under 6 min",
  "6 to 10 min",
  "Over 10 min",
];

const categoryClasses: Record<Protocol["category"], string> = {
  CBT: "bg-teal-50 text-teal-700 border-teal-100",
  DBT: "bg-sky-50 text-sky-700 border-sky-100",
  Mindfulness: "bg-slate-100 text-slate-700 border-slate-200",
  Regulation: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<FocusFilter>("All Focus");
  const [selectedDuration, setSelectedDuration] =
    useState<DurationFilter>("All Durations");

  const filteredProtocols = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return protocols.filter((protocol) => {
      const matchesSearch =
        query.length === 0 ||
        protocol.title.toLowerCase().includes(query) ||
        protocol.description.toLowerCase().includes(query) ||
        protocol.focus.toLowerCase().includes(query) ||
        protocol.category.toLowerCase().includes(query);

      const matchesFocus =
        selectedFilter === "All Focus" || protocol.category === selectedFilter;

      const matchesDuration =
        selectedDuration === "All Durations" ||
        (selectedDuration === "Under 6 min" && protocol.duration < 6) ||
        (selectedDuration === "6 to 10 min" &&
          protocol.duration >= 6 &&
          protocol.duration <= 10) ||
        (selectedDuration === "Over 10 min" && protocol.duration > 10);

      return matchesSearch && matchesFocus && matchesDuration;
    });
  }, [searchQuery, selectedFilter, selectedDuration]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedFilter !== "All Focus" ||
    selectedDuration !== "All Durations";

  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <TopBar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <HeroSection />
        <FeaturedRow />
        <SearchFilters
          searchQuery={searchQuery}
          selectedFilter={selectedFilter}
          selectedDuration={selectedDuration}
          onSearchChange={setSearchQuery}
          onFilterChange={setSelectedFilter}
          onDurationChange={(value) =>
            setSelectedDuration(value as DurationFilter)
          }
        />
        <LibraryGrid
          items={filteredProtocols}
          hasActiveFilters={hasActiveFilters}
          totalCount={protocols.length}
        />
      </main>

      <FooterStrip />
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
          <span className="text-slate-900">Protocol Library</span>
          <span className="text-slate-300">/</span>
          <span className="rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] text-teal-700">
            Session Streak: 12 Days
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-700"
          >
            Support
          </button>
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <HelpCircle size={16} />
          </button>
          <button
            type="button"
            className="rounded-md border border-teal-100 bg-teal-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700"
          >
            System Status
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="py-1">
      <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600">
        Evidence-Based Care
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Personalized Recommendations
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base">
        Strategic interventions optimized for your current state of regulation.
      </p>
    </section>
  );
}

function FeaturedRow() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {featuredProtocols.map((protocol) => (
        <FeaturedProtocolCard key={protocol.title} protocol={protocol} />
      ))}
    </section>
  );
}

function FeaturedProtocolCard({ protocol }: { protocol: FeaturedProtocol }) {
  const Icon = protocol.icon;

  if (protocol.featured) {
    const featuredContent = (
      <>
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-400/10 blur-2xl" />

        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 text-teal-200">
              <Icon size={18} />
            </span>
            <span className="rounded-md border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-100">
              {protocol.badge}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            {protocol.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {protocol.description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              {protocol.duration}
            </p>
            <ArrowRight size={18} className="text-teal-200" />
          </div>
        </div>
      </>
    );

    if (protocol.href) {
      return (
        <Link
          href={protocol.href}
          className="relative block overflow-hidden rounded-2xl border cursor-pointer border-slate-900/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-sm shadow-slate-900/20 transition-opacity hover:opacity-95"
        >
          {featuredContent}
        </Link>
      );
    }

    return (
      <article className="relative overflow-hidden rounded-2xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-sm shadow-slate-900/20">
        {featuredContent}
      </article>
    );
  }

  return (
    <Link
      href={protocol.href as string}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-teal-100"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <Icon size={18} />
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {protocol.badge}
        </span>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        {protocol.title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        {protocol.description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {protocol.duration}
        </p>
        <ArrowRight size={18} className="text-slate-400" />
      </div>
    </Link>
  );
}

function SearchFilters({
  searchQuery,
  selectedFilter,
  selectedDuration,
  onSearchChange,
  onFilterChange,
  onDurationChange,
}: {
  searchQuery: string;
  selectedFilter: FocusFilter;
  selectedDuration: DurationFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FocusFilter) => void;
  onDurationChange: (value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search therapeutic protocols..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-16 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              Clear
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="duration-filter">
            Duration
          </label>
          <select
            id="duration-filter"
            value={selectedDuration}
            onChange={(event) => onDurationChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            {durationFilters.map((duration) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>

          {focusFilters.map((pill) => (
            <FilterPill
              key={pill}
              active={selectedFilter === pill}
              onClick={() => onFilterChange(pill)}
            >
              {pill}
            </FilterPill>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
        active
          ? "border-teal-200 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function LibraryGrid({
  items,
  hasActiveFilters,
  totalCount,
}: {
  items: Protocol[];
  hasActiveFilters: boolean;
  totalCount: number;
}) {
  return (
    <section>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        {hasActiveFilters
          ? `${items.length} protocols matching your filters`
          : `${totalCount} protocols available`}
      </p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            No matching protocols found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your search, focus filter, or duration range.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <ProtocolCard key={item.id} protocol={item} />
          ))}
          <BrowseLibraryCard />
        </div>
      )}
    </section>
  );
}

function ProtocolCard({ protocol }: { protocol: Protocol }) {
  const Icon = protocol.icon;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-teal-100">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon size={17} />
        </span>
        <span
          className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryClasses[protocol.category]}`}
        >
          {protocol.category}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900">{protocol.title}</h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-500">
        {protocol.description}
      </p>

      <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Focus
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {protocol.focus}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <Clock3 size={13} />
          {protocol.duration}M
        </span>
      </div>
    </article>
  );
}

function BrowseLibraryCard() {
  return (
    <article className="grid h-full min-h-[230px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center shadow-sm">
      <div>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500">
          <Plus size={20} />
        </span>
        <h3 className="mt-4 text-lg font-bold text-slate-900">
          Browse Library
        </h3>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          View 40+ Additional Protocols
        </p>
      </div>
    </article>
  );
}

function FooterStrip() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <Shield size={12} />
        <span>
          Enterprise Security Core • End-to-End Encryption • HIPAA Compliant
          Environment
        </span>
      </div>
    </footer>
  );
}
