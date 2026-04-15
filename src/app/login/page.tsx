import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-white via-teal-50 to-blue-50 p-4 font-sans">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-200/20 blur-[120px]" />

      <div className="relative z-10 flex w-full max-w-7xl justify-center lg:justify-end lg:pr-[10%]">
        <section className="w-full max-w-[460px]">
          <Suspense fallback={<LoginShell />}>
            <LoginForm />
          </Suspense>

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

function LoginShell() {
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
        <p className="text-sm font-medium text-slate-500">
          Elevate your practice with intelligence.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Email
          </label>
          <div className="h-[58px] rounded-xl border border-slate-200 bg-white/50" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Password
            </label>
            <span className="text-[11px] font-semibold text-teal-600">
              Recovery access?
            </span>
          </div>
          <div className="h-[58px] rounded-xl border border-slate-200 bg-white/50" />
        </div>

        <div className="h-14 animate-pulse rounded-xl bg-teal-100/70" />
      </div>
    </div>
  );
}
