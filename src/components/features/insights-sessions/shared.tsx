import type { ReactNode } from "react";

type Tone = "slate" | "teal" | "amber" | "rose" | "violet";

export type HeaderMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
};

export type TrendLinePoint = {
  label: string;
  value: number;
  caption?: string;
};

const metricToneStyles: Record<Tone, string> = {
  slate: "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50",
  teal: "border-teal-100 dark:border-teal-900/40 bg-teal-50/80 dark:bg-teal-900/10",
  amber: "border-amber-100 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-900/10",
  rose: "border-rose-100 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-900/10",
  violet: "border-violet-100 dark:border-violet-900/40 bg-violet-50/80 dark:bg-violet-900/10",
};

const pillToneStyles: Record<Tone, string> = {
  slate: "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  teal: "border-teal-200 dark:border-teal-900/40 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400",
  amber: "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  rose: "border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400",
  violet: "border-violet-200 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  metrics,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  metrics?: readonly HeaderMetric[];
}) {
  return (
    <header className="overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* HEADER TOP */}
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-5 lg:px-6">
        <div className="flex w-full items-start justify-between">
          {/* LEFT */}
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold uppercase tracking-[0.28em] text-teal-600 dark:text-teal-400">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>

      {/* METRICS */}
      {metrics?.length ? (
        <div className="grid gap-2 px-4 py-4 md:grid-cols-3 xl:grid-cols-5">
          {" "}
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
              tone={metric.tone}
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function SurfaceCard({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "slate",
}: HeaderMetric) {
  const isCheckIn = label.toLowerCase().includes("check");

  return (
    <div
      className={`rounded-lg border ${
        isCheckIn
          ? "p-2 min-h-[90px]" // 🔥 smaller height
          : "p-3.5 min-h-[140px]"
      } ${metricToneStyles[tone]}`}
    >
      <p
        className={`${
          isCheckIn ? "text-[9px]" : "text-xs"
        } font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400`}
      >
        {label}
      </p>

      <p
        className={`${
          isCheckIn ? "text-lg" : "text-2xl"
        } mt-1 font-semibold text-slate-900 dark:text-slate-100`}
      >
        {value}
      </p>

      <p
        className={`${
          isCheckIn ? "text-[10px]" : "text-xs"
        } mt-1 text-slate-500 dark:text-slate-400`}
      >
        {detail}
      </p>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${pillToneStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export function TrendLineChart({
  points,
  min = 0,
  max = 100,
  strokeColor = "#0f766e",
  fillColor = "rgba(15, 118, 110, 0.14)",
}: {
  points: readonly TrendLinePoint[];
  min?: number;
  max?: number;
  strokeColor?: string;
  fillColor?: string;
}) {
  if (points.length === 0) return null;

  const width = 100;
  const height = 56;
  const paddingX = 6;
  const paddingY = 8;
  const range = Math.max(max - min, 1);

  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : paddingX +
          (index * (width - paddingX * 2)) / Math.max(points.length - 1, 1);

    const y =
      height -
      paddingY -
      ((point.value - min) / range) * (height - paddingY * 2);

    return { ...point, x, y };
  });

  const linePath = coordinates
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = [
    `M ${coordinates[0].x} ${height - paddingY}`,
    ...coordinates.map((p) => `L ${p.x} ${p.y}`),
    `L ${coordinates[coordinates.length - 1].x} ${height - paddingY}`,
    "Z",
  ].join(" ");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
          <path d={areaPath} fill={fillColor} />
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
          />
        </svg>
      </div>
    </div>
  );
}
