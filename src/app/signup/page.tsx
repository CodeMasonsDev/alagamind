"use client";

import { login, register } from "@/api/auth/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await register(formData);

      try {
        await login({
          email: formData.email,
          password: formData.password,
        });

        router.replace("/dashboard");
        router.refresh();
      } catch {
        router.replace("/login?registered=1");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-white via-teal-50 to-blue-50 p-4 font-sans">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-200/20 blur-[120px]" />

      <div className="relative z-10 flex w-full max-w-7xl justify-center lg:justify-end lg:pr-[10%]">
        <section className="w-full max-w-[480px]">
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
                Begin Your Journey
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Create your account, then continue directly into the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jordan"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-teal-500 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Henderson"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-teal-500 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-teal-500 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-teal-500 focus:outline-hidden focus:ring-4 focus:ring-teal-500/10"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex items-start gap-3 py-2">
                <div className="relative flex h-5 items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="h-5 w-5 cursor-pointer rounded-md border-slate-200 accent-teal-500 focus:ring-teal-500/20"
                    required
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="cursor-pointer select-none text-sm leading-tight text-slate-500"
                >
                  I acknowledge the{" "}
                  <a
                    href="#"
                    className="font-bold text-teal-600 hover:underline"
                  >
                    Terms of Resilience
                  </a>
                </label>
              </div>

              {error ? (
                <p className="text-sm font-medium text-rose-600">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-500 to-teal-600 py-4 font-semibold text-white shadow-xl shadow-teal-500/25 transition-all duration-200 hover:from-teal-600 hover:to-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium">
              <span className="text-slate-400">Already have an account? </span>
              <a
                href="/login"
                className="font-bold text-teal-600 transition-colors hover:text-teal-700"
              >
                Sign In
              </a>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              HIPAA READY
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              AES-256
            </div>
            <div>© 2026 ALGMND</div>
          </div>
        </section>
      </div>
    </main>
  );
}
