"use client";

import { login } from "@/api/auth/auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";

/* ── animation helpers ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const wasJustRegistered = searchParams.get("registered") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to login right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      className="relative w-full rounded-[2.5rem] border  border-slate-200 bg-white/60 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.03),0_0_20px_rgba(255,255,255,0.8)_inset] backdrop-blur-3xl dark:border-slate-700/50 dark:bg-slate-800/40 dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] sm:p-12 transition-colors duration-700"
    >
      <motion.div variants={container} initial="hidden" animate="show">
        {/* ── Heading ── */}
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-800 drop-shadow-sm dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Sign in to continue your wellness journey.
          </p>
        </motion.div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <motion.div variants={fadeUp} className="space-y-2.5">
            <label className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Email
            </label>
            <div
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 border ${
                focusedField === "email"
                  ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                  : "border-slate-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] dark:border-white/[0.05] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
              }`}
            >
              {/* Internal glow layer */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${focusedField === "email" ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`}
              />

              <input
                id="login-email"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="relative w-full bg-white px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                required
              />
            </div>
          </motion.div>

          {/* Password field */}
          <motion.div variants={fadeUp} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Password
              </label>
              <a
                href="#"
                className="text-[10px] font-bold uppercase tracking-widest text-teal-600 transition-colors hover:text-teal-700 dark:text-teal-400/80 dark:hover:text-teal-300"
              >
                Restore
              </a>
            </div>
            <div
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 border ${
                focusedField === "password"
                  ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                  : "border-slate-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] dark:border-white/[0.05] dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
              }`}
            >
              {/* Internal glow layer */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${focusedField === "password" ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent dark:from-teal-400/10 dark:via-cyan-400/5`}
              />

              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="relative w-full bg-white px-5 py-4 text-sm font-medium tracking-widest text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none dark:bg-black/20 dark:text-white dark:placeholder:text-slate-600"
                required
              />
            </div>
          </motion.div>

          {/* Status messages */}
          {wasJustRegistered ? (
            <motion.p
              variants={fadeUp}
              className="flex items-center gap-3 rounded-2xl bg-teal-500/10 px-5 py-4 text-sm font-semibold text-teal-700 backdrop-blur-md dark:bg-teal-500-[0.08] dark:text-teal-300"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400">
                ✓
              </span>
              Account created successfully.
            </motion.p>
          ) : null}

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-700 backdrop-blur-md dark:bg-rose-500/[0.08] dark:text-rose-400"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                !
              </span>
              {error}
            </motion.p>
          ) : null}

          {/* Submit button (Professional SaaS) */}
          <motion.div variants={fadeUp} className="pt-4">
            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-slate-900 px-6 py-4 text-sm font-bold tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </motion.div>
        </form>

        {/* ── Divider ── */}
        <motion.div variants={fadeUp} className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-white/[0.05]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white/50 px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 backdrop-blur-sm dark:bg-[#060b17] dark:text-slate-600">
              OR CONTINUE WITH
            </span>
          </div>
        </motion.div>

        {/* ── Google sign-in ── */}
        <motion.button
          variants={fadeUp}
          type="button"
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </motion.button>

        {/* ── Sign up link ── */}
        <motion.div
          variants={fadeUp}
          className="mt-10 text-center text-xs font-semibold tracking-wider"
        >
          <span className="text-slate-500">NEW TO ALAGAMIND? </span>
          <a
            href="/signup"
            className="text-teal-600 transition-colors hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
          >
            CREATE ACCOUNT
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ── Suspense skeleton ── */
function LoginShell() {
  return (
    <div className="rounded-[2.5rem] border border-white/30 bg-white/40 p-10 shadow-[0_30px_60px_rgba(0,0,0,0.05)] backdrop-blur-2xl dark:border-white/[0.06] dark:bg-white/[0.02] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
      <div className="mb-10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200/50 dark:bg-white/10" />
        <div className="h-6 w-32 rounded-md bg-slate-200/50 dark:bg-white/10" />
      </div>
      <div className="mb-10">
        <div className="mb-3 h-10 w-56 rounded-md bg-slate-200/50 dark:bg-white/10" />
        <div className="h-5 w-64 rounded-md bg-slate-100/50 dark:bg-white/[0.05]" />
      </div>
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-14 rounded bg-slate-200/50 dark:bg-white/[0.06]" />
          <div className="h-[56px] rounded-2xl bg-white/50 dark:bg-white/[0.03]" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-slate-200/50 dark:bg-white/[0.06]" />
            <div className="h-3 w-24 rounded bg-slate-200/50 dark:bg-white/[0.06]" />
          </div>
          <div className="h-[56px] rounded-2xl bg-white/50 dark:bg-white/[0.03]" />
        </div>
        <div className="mt-2 h-[60px] animate-pulse rounded-2xl bg-teal-100/50 dark:bg-teal-500/10" />
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginFormInner />
    </Suspense>
  );
}
