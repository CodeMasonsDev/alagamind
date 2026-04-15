"use client";

import { login } from "@/api/auth/auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <div className="rounded-[32px] border border-slate-200/60 bg-white/90 p-8 shadow-2xl shadow-slate-200/40 backdrop-blur-xs transition-all duration-500 md:p-10">
      <div className="mb-8 flex items-center gap-2">
        <div className="h-8 w-8 text-teal-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            <path d="M19 3v4" />
            <path d="M21 5h-4" />
          </svg>
        </div>
        <span className="text-xl tracking-tight text-slate-800">
          <span className="font-bold">Alaga</span>
          <span className="font-light">Mind</span>
        </span>
      </div>

      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome Back
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Email
          </label>
          <input
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-teal-500 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Password
            </label>
            <a
              href="#"
              className="text-[11px] font-semibold text-teal-600 transition-colors hover:text-teal-700"
            >
              Recovery access?
            </a>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-teal-500 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10"
            required
          />
        </div>

        {wasJustRegistered ? (
          <p className="text-sm font-medium text-teal-600">
            Account created successfully. Sign in to continue.
          </p>
        ) : null}

        {error ? (
          <p className="text-sm font-medium text-rose-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-500 to-teal-600 py-4 font-semibold text-white shadow-xl shadow-teal-500/25 transition-all duration-200 hover:from-teal-600 hover:to-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Login"}
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"></div>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm font-bold tracking-tight text-slate-700 transition-all duration-200 hover:bg-slate-50 active:bg-slate-100"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
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
        Sign in with Google
      </button>

      <div className="mt-8 text-center text-sm font-medium">
        <span className="text-slate-400">No account yet? </span>
        <a
          href="/signup"
          className="font-bold text-teal-600 transition-colors hover:text-teal-700"
        >
          Create Account
        </a>
      </div>
    </div>
  );
}
