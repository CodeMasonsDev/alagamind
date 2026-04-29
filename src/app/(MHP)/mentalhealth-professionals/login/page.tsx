"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import {
  ArrowLeft,
  Stethoscope,
  Clipboard,
  Users,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import MHPLoginForm from "./login-form";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

let mhpLoginThemeToggleHydrated = false;

function subscribeHydration(callback: () => void) {
  if (!mhpLoginThemeToggleHydrated) {
    queueMicrotask(() => {
      mhpLoginThemeToggleHydrated = true;
      callback();
    });
  }
  return () => {};
}

function getHydrationSnapshot() {
  return mhpLoginThemeToggleHydrated;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    () => false,
  );

  const themes = [
    { id: "light", label: "Light", Icon: Sun },
    { id: "dark", label: "Dark", Icon: Moon },
    { id: "system", label: "System", Icon: Monitor },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/60 bg-white/70 text-slate-700 shadow-sm backdrop-blur-2xl transition-colors hover:bg-white/85 dark:border-white/14 dark:bg-white/10 dark:text-white/80 dark:shadow-none dark:hover:bg-white/16"
        aria-label="Toggle theme"
      >
        {!hydrated ? (
          <Monitor className="h-4 w-4 opacity-70" />
        ) : theme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : theme === "light" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
      </button>

      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : -8,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.18 }}
        className="absolute right-0 top-12 z-50 w-36 overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/12 dark:bg-slate-950/95"
      >
        {themes.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTheme(id);
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
              hydrated && theme === id
                ? "bg-teal-50 text-teal-700 dark:bg-teal-400/12 dark:text-teal-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function BackgroundBlur({ x, y }: { x: number; y: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] dark:bg-[#03080f]" />

      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]" />
      <div className="absolute -left-[14%] top-[10%] hidden h-[46rem] w-[46rem] rounded-full bg-teal-500/14 blur-[155px] dark:block" />
      <div className="absolute left-[18%] top-[40%] hidden h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[165px] dark:block" />
      <div className="absolute right-[-12%] top-[14%] hidden h-[40rem] w-[40rem] rounded-full bg-indigo-500/18 blur-[170px] dark:block" />
      <div className="absolute right-[6%] bottom-[-16%] hidden h-[34rem] w-[34rem] rounded-full bg-violet-500/14 blur-[160px] dark:block" />
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-700 dark:block dark:opacity-80"
        style={{
          background: `radial-gradient(820px circle at ${x}px ${y}px, rgba(20,184,166,0.18), transparent 42%)`,
        }}
      />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.34)_56%,rgba(2,6,23,0.78)_100%)]" />

      <div className="login-grain absolute inset-0 opacity-[0.06] dark:opacity-[0.12]" />
      <div className="absolute inset-0 backdrop-blur-[18px] dark:backdrop-blur-[86px]" />
    </div>
  );
}

const mhpFeatures = [
  {
    Icon: Clipboard,
    title: "Client Management",
    body: "Track client sessions, progress, and insights in one place",
  },
  {
    Icon: Stethoscope,
    title: "Professional Tools",
    body: "Access comprehensive client data and assessment reports",
  },
  {
    Icon: Users,
    title: "Collaboration",
    body: "Coordinate with other professionals for better client care",
  },
];

export default function MHPLoginPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <main
      onMouseMove={(e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }}
      className={`${serif.variable} relative min-h-screen w-full overflow-x-hidden text-slate-900 dark:text-white`}
    >
      <BackgroundBlur x={mousePosition.x} y={mousePosition.y} />

      <div className="relative z-10 flex flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex  items-center gap-3 rounded-full border border-slate-200/60 bg-white/65 px-5.5 py-1 text-sm text-slate-800 shadow-sm backdrop-blur-2xl transition-colors hover:bg-white/80 dark:border-white/12 dark:bg-white/8 dark:text-white/86 dark:shadow-none dark:hover:bg-white/12"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl">
              <img
                src="/alagamind.png?v=2"
                alt="AlagaMind logo"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="tracking-tight">
              <span className="font-semibold">Alaga</span>
              <span className="font-light">Mind</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/65 px-3.5 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-2xl transition-colors hover:bg-white/80 dark:border-white/12 dark:bg-white/8 dark:text-white/78 dark:shadow-none dark:hover:bg-white/12 sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="flex items-start sm:items-center px-4 pt-6 sm:pt-12 pb-8 sm:px-6 sm:pb-12 lg:px-8 lg:pb-16">
          <div className="mx-auto grid h-full w-full max-w-[1200px] min-h-0 grid-cols-1 items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <section className="hidden min-h-0 flex-col justify-center lg:flex">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-[620px]"
              >
                <h1 className="mt-0 max-w-[12ch] text-[clamp(3rem,4.8vw,5.4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-slate-900 dark:text-white">
                  Your clients
                  <span className="mt-5 block font-[family-name:var(--font-serif)] italic font-normal text-slate-900 dark:text-teal-200/95">
                    deserve expert care.
                  </span>
                </h1>

                <p className="mt-5 max-w-[54ch] text-[15px] leading-8 text-slate-600 dark:text-white/70">
                  Comprehensive tools to manage your practice - client insights,
                  session tracking, and collaborative care in one professional
                  platform.
                </p>

                <div className="mt-7 grid max-w-[640px] gap-3">
                  {mhpFeatures.map(({ Icon, title, body }) => (
                    <div
                      key={title}
                      className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/8 dark:shadow-none"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-200/50 bg-teal-50 text-teal-700 dark:border-teal-300/18 dark:bg-teal-400/10 dark:text-teal-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                          {title}
                        </h2>
                        <p className="mt-1 text-[13px] leading-6 text-slate-600 dark:text-white/64">
                          {body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            <section className="flex min-h-0 items-center justify-center lg:justify-end">
              <div className="flex w-full max-w-[470px] flex-col justify-center">
                <div className="mb-4 text-center lg:hidden">
                  <h1 className="text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-900 dark:text-white">
                    Professional Access
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/68">
                    Sign in to access your client dashboard and professional
                    tools.
                  </p>
                </div>

                <MHPLoginForm />

                <div className="mt-4 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-white/42">
                  <span className="flex justify-center items-center ">
                    <span className="text-2xl">©</span> 2026 AlagaMind
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-400/40 dark:bg-white/20" />
                  <Link
                    href="#"
                    className="transition-colors hover:text-slate-700 dark:hover:text-white/70"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="#"
                    className="transition-colors hover:text-slate-700 dark:hover:text-white/70"
                  >
                    Terms
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
