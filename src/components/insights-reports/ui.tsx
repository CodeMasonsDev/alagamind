import type { ReactNode } from "react";

export function InsightsReportsSection({
  eyebrow,
  title,
  description,
  children,
  aside,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </p>
      <div className="mt-2.5 overflow-hidden rounded-[24px] border border-slate-200 bg-white text-slate-900 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </section>
  );
}

export function InsightsPill({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "teal" | "amber" | "rose" | "blue";
}) {
  const toneStyles = {
    slate: "border-slate-200 bg-slate-100 text-slate-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export function InsightsMetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{detail}</p>
    </article>
  );
}

export function EmptySectionCopy({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm leading-7 text-slate-500">
      {message}
    </div>
  );
}

export function PercentageBar({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) {
  const width = clampPercent(value);

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
