import { Suspense } from "react";
import { AdminLoginFormInner } from "./login-form";

function AdminLoginSkeleton() {
  return (
    <div className="w-full max-w-md space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="h-6 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)] px-4 dark:bg-[radial-gradient(circle_at_top_right,#17324d_0%,#0f172a_24%,#020617_100%)]">
      <div className="w-full max-w-md rounded-2xl border border-white/14 bg-white/68 backdrop-blur-3xl p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xl">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to continue
          </p>
        </div>

        <Suspense fallback={<AdminLoginSkeleton />}>
          <AdminLoginFormInner />
        </Suspense>
      </div>
    </div>
  );
}
