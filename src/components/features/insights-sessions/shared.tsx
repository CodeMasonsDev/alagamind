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
    <header className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-6 border-b border-slate-200 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-500 lg:text-base">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>

      {metrics?.length ? (
        <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
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
      className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}
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
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "slate",
}: HeaderMetric) {
  return (
    <div className={`rounded-2xl border p-4 ${metricToneStyles[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
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
  if (points.length === 0) {
    return null;
  }

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
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = [
    `M ${coordinates[0].x} ${height - paddingY}`,
    ...coordinates.map((point) => `L ${point.x} ${point.y}`),
    `L ${coordinates[coordinates.length - 1].x} ${height - paddingY}`,
    "Z",
  ].join(" ");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full overflow-visible"
          role="img"
          aria-label="Trend chart"
        >
          {[1, 2, 3].map((line) => {
            const y = paddingY + ((height - paddingY * 2) / 4) * line;
            return (
              <line
                key={line}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#cbd5e1"
                strokeDasharray="2 2"
                strokeWidth="0.4"
              />
            );
          })}

          <path d={areaPath} fill={fillColor} />
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coordinates.map((point) => (
            <circle
              key={`${point.label}-${point.value}`}
              cx={point.x}
              cy={point.y}
              r="1.8"
              fill={strokeColor}
              stroke="white"
              strokeWidth="0.8"
            />
          ))}
        </svg>
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
        }}
      >
        {points.map((point) => (
          <div key={`${point.label}-${point.value}`} className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{point.label}</p>
            <p className="text-xs text-slate-500">{point.value}</p>
            {point.caption ? (
              <p className="truncate text-xs text-slate-400">{point.caption}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
