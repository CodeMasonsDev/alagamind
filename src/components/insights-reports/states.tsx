import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

export function InsightsReportsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[140px] animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-[28px] border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60"
          />
        ))}
      </div>
    </div>
  );
}

export function InsightsReportsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-rose-100 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">
        Insights unavailable
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:hover:bg-slate-700"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

export function InsightsReportsEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
        <LoaderCircle className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">
        No report data yet
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
