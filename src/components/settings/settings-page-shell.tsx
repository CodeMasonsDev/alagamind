import type { ReactNode } from "react";

type Tone = "slate" | "teal" | "amber" | "rose" | "violet";

const toneStyles: Record<Tone, string> = {
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  teal: "border-teal-100 bg-teal-50 text-teal-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  rose: "border-rose-100 bg-rose-50 text-rose-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

const metricToneStyles: Record<Tone, string> = {
  slate: "border-slate-200 bg-slate-50/80",
  teal: "border-teal-100 bg-teal-50/80",
  amber: "border-amber-100 bg-amber-50/80",
  rose: "border-rose-100 bg-rose-50/80",
  violet: "border-violet-100 bg-violet-50/80",
};

export type SettingsMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
};

export function SettingsPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full w-full bg-[linear-gradient(180deg,#fffdf4_0%,#f6f7fb_100%)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function SettingsHero({
  badge,
  title,
  description,
  actions,
  metrics,
}: {
  badge: string;
  title: string;
  description: string;
  actions?: ReactNode;
  metrics?: readonly SettingsMetric[];
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            {badge}
          </span>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          </div>

          {actions ? (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>

        {metrics?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <SettingsMetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                detail={metric.detail}
                tone={metric.tone}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SettingsMetricCard({
  label,
  value,
  detail,
  tone = "slate",
}: SettingsMetric) {
  return (
    <article className={`rounded-2xl border p-4 ${metricToneStyles[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

export function SettingsPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function SettingsPanelBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-6 ${className}`}>{children}</div>;
}

export function SettingsSectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function SettingsBadge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}
