import { StackedActivityChart } from "./chart-primitives";
import { EmptySectionCopy, InsightsReportsSection } from "./ui";
import type { WeeklyActivity as WeeklyActivityData } from "@/features/insights-reports/types";

export default function WeeklyActivity({
  weeklyActivity,
}: {
  weeklyActivity: WeeklyActivityData | null;
}) {
  const days = weeklyActivity?.days ?? [];

  return (
    <InsightsReportsSection
      eyebrow="Weekly Activity"
      title="Module usage by day"
      description={
        weeklyActivity
          ? `${formatDate(weeklyActivity.week_start)} - ${formatDate(weeklyActivity.week_end)}`
          : "No weekly activity window available."
      }
    >
      {days.length > 0 ? (
        <StackedActivityChart
          days={days.map((day, index) => ({
            dayKey: `${day.date || day.day_key || day.day_label || "day"}-${index}`,
            dayLabel: day.day_label || day.day_key || "?",
            companion: day.companion,
            journal: day.journal,
            reframing: day.reframing,
            total: day.total,
          }))}
        />
      ) : (
        <EmptySectionCopy message="No weekly activity data is available for this range." />
      )}
    </InsightsReportsSection>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
