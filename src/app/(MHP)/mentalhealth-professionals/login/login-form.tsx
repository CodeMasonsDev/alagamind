"use client";

import { login } from "@/api/auth/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useId, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

function Field({
  id,
  label,
  type,
  value,
  onChange,
  Icon,
  placeholder,
  rightSlot,
  autoComplete,
  required,
  inputMode,
  state,
  helper,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  placeholder?: string;
  rightSlot?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
  inputMode?: "text" | "email" | "numeric";
  state?: "default" | "valid" | "error";
  helper?: string;
}) {
  const [focused, setFocused] = useState(false);
  const isValid = state === "valid";
  const isError = state === "error";

  const ringColor = isError
    ? "border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.08)] dark:border-rose-500/50 dark:shadow-[0_0_30px_rgba(244,63,94,0.15)]"
    : focused
      ? "border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.10)] dark:border-teal-500/50 dark:shadow-[0_0_30px_rgba(20,184,166,0.2)]"
      : "border-slate-300 dark:border-white/[0.05]";

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block px-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      <div
        className={`group relative flex items-center overflow-hidden rounded-2xl border bg-white/90 transition-all duration-300 dark:bg-black/20 ${ringColor}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${focused ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-teal-400/10 via-cyan-400/5 to-transparent`}
        />
        <Icon
          className={`pointer-events-none absolute left-3.5 h-[16px] w-[16px] transition-colors ${
            focused
              ? "text-teal-500 dark:text-teal-300"
              : isError
                ? "text-rose-500"
                : "text-slate-400 dark:text-slate-500"
          }`}
          strokeWidth={2}
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={isError || undefined}
          aria-describedby={helper ? `${id}-helper` : undefined}
          className="relative w-full rounded-2xl bg-transparent py-4 pl-10 pr-12 text-[14px] font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-600"
        />
        {rightSlot && (
          <div className="absolute right-2 flex items-center">{rightSlot}</div>
        )}
        {isValid && !rightSlot && (
          <CheckCircle2
            className="absolute right-3.5 h-4 w-4 text-emerald-500"
            strokeWidth={2}
          />
        )}
      </div>
      <AnimatePresence>
        {helper && (
          <motion.p
            id={`${id}-helper`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`px-0.5 text-[12px] ${
              isError
                ? "text-rose-500 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {helper}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function MHPLoginFormInner() {
  const searchParams = useSearchParams();
  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wasJustRegistered = searchParams.get("registered") === "1";
  const router = useRouter();
  const emailLooksValid = /^\S+@\S+\.\S+$/.test(email);
  const emailState: "default" | "valid" | "error" =
    email.length > 0 && !emailLooksValid
      ? "error"
      : emailLooksValid
        ? "valid"
        : "default";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.replace("/mentalhealth-professionals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative rounded-[2.25rem] border border-white/14 bg-white/68 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.03),0_0_20px_rgba(255,255,255,0.72)_inset] backdrop-blur-3xl sm:p-8 dark:border-white/10 dark:bg-slate-800/42 dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[2.5rem] bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/[0.08]"
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <h2 className="text-[24px] font-black tracking-tight text-slate-900 drop-shadow-sm dark:text-white">
              Welcome back
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
              Access your client dashboard and manage sessions.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <motion.div variants={fadeUp}>
              <Field
                id={emailId}
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                Icon={Mail}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                required
                state={emailState}
                helper={
                  emailState === "error"
                    ? "Please enter a valid email address."
                    : undefined
                }
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Field
                id={passwordId}
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                Icon={Lock}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[15px] w-[15px]" strokeWidth={2} />
                    ) : (
                      <Eye className="h-[15px] w-[15px]" strokeWidth={2} />
                    )}
                  </button>
                }
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center justify-between pt-0.5"
            >
              <label
                htmlFor={rememberId}
                className="group flex cursor-pointer items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-400"
              >
                <span className="relative inline-flex h-[16px] w-[16px] items-center justify-center">
                  <input
                    id={rememberId}
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-[5px] border border-slate-300 bg-white transition-all peer-checked:border-teal-500 peer-checked:bg-teal-500 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-400/60 dark:border-white/[0.15] dark:bg-white/[0.04] dark:peer-checked:border-teal-400 dark:peer-checked:bg-teal-400" />
                  <svg
                    viewBox="0 0 16 16"
                    className={`relative h-3 w-3 transition-opacity ${remember ? "opacity-100" : "opacity-0"}`}
                    aria-hidden
                  >
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Remember me
              </label>

              <Link
                href="#"
                className="text-[13px] font-medium text-teal-700 transition-colors hover:text-teal-800 focus-visible:outline-none focus-visible:underline dark:text-teal-300 dark:hover:text-teal-200"
              >
                Forgot password?
              </Link>
            </motion.div>

            <AnimatePresence mode="wait">
              {wasJustRegistered && !error && (
                <motion.div
                  key="registered"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3.5 py-3 text-[13px] font-medium text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/[0.06] dark:text-emerald-300"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    strokeWidth={2}
                  />
                  Account created. Welcome aboard.
                </motion.div>
              )}
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200/60 bg-rose-50/80 px-3.5 py-3 text-[13px] font-medium text-rose-800 dark:border-rose-400/15 dark:bg-rose-400/[0.06] dark:text-rose-300"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    strokeWidth={2}
                  />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp} className="pt-1">
              <button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_25px_-10px_rgba(20,184,166,0.6)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_18px_40px_-12px_rgba(20,184,166,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-slate-950"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      strokeWidth={2.5}
                    />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-[11.25px] leading-relaxed text-slate-500 dark:text-slate-500">
                By signing in, you agree to our{" "}
                <Link
                  href="#"
                  className="text-slate-700 underline-offset-2 hover:underline dark:text-slate-300"
                >
                  Terms
                </Link>{" "}
                &{" "}
                <Link
                  href="#"
                  className="text-slate-700 underline-offset-2 hover:underline dark:text-slate-300"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </motion.div>
          </form>

          <motion.div
            variants={fadeUp}
            className="mt-5 border-t border-slate-200/70 pt-4 text-center text-[13px] dark:border-white/[0.06]"
          >
            <span className="text-slate-600 dark:text-slate-400">
              New to AlagaMind?{" "}
            </span>
            <Link
              href="/mentalhealth-professionals/register"
              className="font-semibold text-teal-700 transition-colors hover:text-teal-800 focus-visible:outline-none focus-visible:underline dark:text-teal-300 dark:hover:text-teal-200"
            >
              Create an account
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MHPLoginShell() {
  return (
    <div className="rounded-[2.5rem] border border-slate-200 bg-white/60 p-10 backdrop-blur-3xl dark:border-slate-700/50 dark:bg-slate-800/40 sm:p-12">
      <div className="mb-7 space-y-2">
        <div className="h-7 w-44 animate-pulse rounded-md bg-slate-200/70 dark:bg-white/[0.06]" />
        <div className="h-4 w-60 animate-pulse rounded-md bg-slate-100/70 dark:bg-white/[0.04]" />
      </div>
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-slate-100/70 dark:bg-white/[0.04]" />
        <div className="h-14 animate-pulse rounded-2xl bg-slate-100/70 dark:bg-white/[0.04]" />
        <div className="h-12 animate-pulse rounded-xl bg-teal-200/40 dark:bg-teal-400/10" />
      </div>
    </div>
  );
}

export default function MHPLoginForm() {
  return (
    <Suspense fallback={<MHPLoginShell />}>
      <MHPLoginFormInner />
    </Suspense>
  );
}
