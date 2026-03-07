"use client";
import React from "react";
import Link from "next/link";
import {
  Activity,
  BookOpenText,
  Circle,
  HelpCircle,
  LineChart,
  Shield,
} from "lucide-react";

export default function JournalsReflectionsPage() {
  return (
    <div className="flex min-h-full w-full flex-col bg-slate-50/60">
      <TopBar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection />
        <PrimaryJournalCard />
        <BottomGrid />
      </main>

      <FooterStrip />
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex sticky top-0 z-10 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        <span className="text-slate-900">Journaling Launchpad Hub</span>
        <span className="text-slate-300">/</span>
        <span className="flex items-center gap-1.5 text-teal-600">
          <Circle className="h-2.5 w-2.5 fill-current" />
          Status: Syncing Session
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-700"
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
    </header>
  );
}

function HeroSection() {
  return (
    <section className="py-4 text-center sm:py-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Launchpad Hub
      </h1>
      <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base">
        Welcome back, Maya. Your neural patterns are stabilizing. Choose your
        path for today&apos;s reflection.
      </p>
    </section>
  );
}

function PrimaryJournalCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <BookOpenText size={22} />
            </span>
            <span className="rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Primary Action
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Daily Journal</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
            Engage in high-fidelity, unstructured reflection. Perfect for
            clearing cognitive load, capturing immediate state changes, and
            maintaining your longitudinal growth history.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/journals-reflections/write"
              className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-800"
            >
              Start Writing
            </Link>
            <Link
              href="/journals-reflections/archive"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50"
            >
              View All Journals
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <span className="text-slate-400">Last Entry</span>
            <span className="text-slate-900">2 minutes ago</span>
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Session Streak
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">12 Days</p>
          </div>
          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Cognitive Load
            </p>
            <p className="mt-1 text-sm font-bold uppercase tracking-wide text-teal-600">
              Optimized
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function BottomGrid() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <GuidedSessionsCard />
      <PatternAnalysisCard />
    </section>
  );
}

function GuidedSessionsCard() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Activity size={18} />
          </span>
          <span className="rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
            Step 2 of 4
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900">Guided Sessions</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        &quot;Resilience Building&quot; protocol active. Multi-step coaching
        focused on emotional regulation and neuro-plasticity.
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
          <span className="text-slate-400">Protocol Progress</span>
          <span className="text-teal-700">50% Complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 rounded-full bg-teal-500" />
        </div>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50"
      >
        Resume Session
      </button>
    </article>
  );
}

function PatternAnalysisCard() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <LineChart size={18} />
        </span>
        <svg
          viewBox="0 0 120 36"
          className="h-8 w-28 text-teal-500"
          aria-hidden="true"
        >
          <path
            d="M2 28 C18 26, 22 10, 38 14 C50 17, 56 30, 72 24 C82 20, 92 8, 118 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-slate-900">Pattern Analysis</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Identify recurring emotional themes through neural pattern matching.
        Monitor growth index and sentiment stability.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Growth
          </p>
          <p className="mt-1 text-lg font-black text-teal-600">+12.4%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Themes
          </p>
          <p className="mt-1 text-lg font-black text-slate-900">18 New</p>
        </div>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50"
      >
        Detailed Insights
      </button>
    </article>
  );
}

function FooterStrip() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <Shield size={12} />
        <span>
          Enterprise Security Core • End-to-End Encryption • HIPAA Compliant
          Environment
        </span>
      </div>
    </footer>
  );
}
