import { clampPercent } from "./ui";

export function InsightsLineChart({
  points,
  strokeColor = "#34d399",
  fillColor = "rgba(52, 211, 153, 0.16)",
  showSummary = false,
}: {
  points: { label: string; value: number; caption?: string }[];
  strokeColor?: string;
  fillColor?: string;
  showSummary?: boolean;
}) {
  if (points.length === 0) {
    return null;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const width = 100;
  const height = 56;
  const paddingX = 6;
  const paddingY = 7;

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
      {showSummary ? (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
          }}
        >
          {points.map((point) => (
            <div key={`${point.label}-${point.value}`} className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {point.label}
              </p>
              <p className="text-sm text-slate-500">{point.value}</p>
              {point.caption ? (
                <p className="truncate text-xs text-slate-400">
                  {point.caption}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StackedActivityChart({
  days,
}: {
  days: {
    dayKey: string;
    dayLabel: string;
    companion: number;
    journal: number;
    reframing: number;
    total: number;
  }[];
}) {
  if (days.length === 0) {
    return null;
  }

  const maxTotal = Math.max(...days.map((day) => day.total), 1);

  return (
    <div>
      <div className="flex min-h-[180px] items-end justify-between gap-3">
        {days.map((day) => (
          <div
            key={day.dayKey}
            className="flex flex-1 flex-col items-center gap-3"
          >
            <div className="flex h-32 w-full flex-col justify-end gap-1 rounded-2xl bg-slate-50 px-2 py-2">
              {day.total > 0 ? (
                <>
                  <div
                    className="rounded-sm bg-[#9edbc6]"
                    style={{
                      height: `${Math.max(
                        8,
                        (day.reframing / maxTotal) * 100,
                      )}%`,
                    }}
                  />
                  <div
                    className="rounded-sm bg-[#5ccca6]"
                    style={{
                      height: `${Math.max(8, (day.journal / maxTotal) * 100)}%`,
                    }}
                  />
                  <div
                    className="rounded-sm bg-[#28a37a]"
                    style={{
                      height: `${Math.max(
                        8,
                        (day.companion / maxTotal) * 100,
                      )}%`,
                    }}
                  />
                </>
              ) : (
                <div className="h-1 rounded-full bg-slate-200" />
              )}
            </div>
            <span className="text-sm font-semibold text-slate-500">
              {day.dayLabel}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
        <LegendDot colorClass="bg-[#28a37a]" label="Companion" />
        <LegendDot colorClass="bg-[#5ccca6]" label="Journal" />
        <LegendDot colorClass="bg-[#9edbc6]" label="Reframing" />
      </div>
    </div>
  );
}

export function DistributionBar({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${clampPercent(value)}%` }}
      />
    </div>
  );
}

function LegendDot({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${colorClass}`} />
      {label}
    </span>
  );
}
