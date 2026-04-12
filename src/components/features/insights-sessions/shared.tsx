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
  slate: "border-slate-200 bg-slate-50/80",
  teal: "border-teal-100 bg-teal-50/80",
  amber: "border-amber-100 bg-amber-50/80",
  rose: "border-rose-100 bg-rose-50/80",
  violet: "border-violet-100 bg-violet-50/80",
};

const pillToneStyles: Record<Tone, string> = {
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  teal: "border-teal-200 bg-teal-50 text-teal-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
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
    <header className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      {/* HEADER TOP */}
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:px-6">
        <div className="flex w-full items-start justify-between">
          {/* LEFT */}
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold uppercase tracking-[0.28em] text-teal-600">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
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
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
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
        } font-semibold uppercase tracking-[0.15em] text-slate-500`}
      >
        {label}
      </p>

      <p
        className={`${
          isCheckIn ? "text-lg" : "text-2xl"
        } mt-1 font-semibold text-slate-900`}
      >
        {value}
      </p>

      <p
        className={`${
          isCheckIn ? "text-[10px]" : "text-xs"
        } mt-1 text-slate-500`}
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
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
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
