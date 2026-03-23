"use client";

import { LoaderCircle, Target, Zap } from "lucide-react";
import type {
  FocusMomentumDay,
  FocusMomentumResponse,
} from "@/api/focus-momentum";

type FocusMomentumCardProps = {
  data: FocusMomentumResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
};

export function FocusMomentumCard({
  data,
  isLoading,
  isRefreshing,
  error,
}: FocusMomentumCardProps) {
  const orderedDays = getOrderedDays(data?.days ?? []);
  const hasDayData = orderedDays.length > 0;
  const isEmptyState = isEmptyFocusMomentum(data);

  return (
    <div
      className="self-start flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:h-[332px]"
      data-testid="focus-momentum-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
          Focus Momentum
        </h3>
        <div className="flex items-center gap-2 text-slate-300">
          {isRefreshing ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : null}
          <Target size={16} />
        </div>
      </div>

      {isLoading && !data ? (
        <FocusMomentumSkeleton />
      ) : error && !data ? (
        <FocusMomentumErrorState message={error} />
      ) : data ? (
        <>
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl font-black text-slate-900 tracking-tight"
                data-testid="focus-momentum-streak"
              >
                {data.streak_days}
              </span>
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Day Streak
              </span>
            </div>
            <p className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-teal-600 uppercase mt-1">
              <Zap size={10} />
              Today {Math.round(data.today_percentage)}% / Week Avg{" "}
              {Math.round(data.weekly_average_percentage)}%
            </p>
            <p className="mt-2 text-[11px] text-slate-400">
              Week of {data.week_start} to {data.week_end}
            </p>
          </div>

          <div className="mt-5 flex min-h-[104px] flex-1 items-end justify-between gap-2">
            {hasDayData ? (
              orderedDays.map((day) => {
                const visualPercentage = clampPercentage(day.percentage);
                const isToday = day.date === getTodayDateKey();
                const fillClass = isToday
                  ? "bg-teal-500"
                  : "bg-teal-200 opacity-70";

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    <div
                      className="relative flex h-20 w-full items-end rounded-sm bg-slate-50"
                      title={buildBarTitle(day)}
                      aria-label={buildBarTitle(day)}
                      data-testid={`focus-momentum-bar-${day.date}`}
                    >
                      <div
                        className={`w-full rounded-sm transition-[height] duration-300 ${fillClass}`}
                        style={{ height: `${visualPercentage}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isToday ? "text-teal-600" : "text-slate-400"
                      }`}
                    >
                      {day.day_key || day.day_label}
                    </span>
                  </div>
                );
              })
            ) : (
              <EmptyBars />
            )}
          </div>

          <div className="mt-4 space-y-2">
            {isEmptyState ? (
              <p className="text-xs text-slate-500">
                Start with a check-in, journal, chat, or reframe to build
                momentum this week.
              </p>
            ) : null}

            {error ? (
              <p className="text-xs text-amber-600">
                Couldn&apos;t refresh live data. Showing the last successful
                snapshot.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {data.weekly_totals.checkins} check-ins /{" "}
                {data.weekly_totals.chat} chat turns /{" "}
                {data.weekly_totals.journals} journals /{" "}
                {data.weekly_totals.reframes} reframes
              </p>
            )}
          </div>
        </>
      ) : (
        <FocusMomentumErrorState message="No focus momentum data available yet." />
      )}
    </div>
  );
}

function FocusMomentumSkeleton() {
  return (
    <>
      <div className="animate-pulse">
        <div className="h-10 w-20 bg-slate-100 rounded-md" />
        <div className="mt-3 h-3 w-36 bg-slate-100 rounded-md" />
      </div>

      <div className="mt-5 flex min-h-[104px] flex-1 items-end justify-between gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div className="relative h-20 w-full overflow-hidden rounded-sm bg-slate-50">
              <div className="absolute inset-x-0 bottom-0 h-10 bg-slate-100 animate-pulse rounded-sm" />
            </div>
            <div className="h-2.5 w-3 bg-slate-100 rounded-sm animate-pulse" />
          </div>
        ))}
      </div>
    </>
  );
}

function FocusMomentumErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-6">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-300 tracking-tight">
            --
          </span>
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">
            Day Streak
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">{message}</p>
      </div>
      <EmptyBars />
    </div>
  );
}

function EmptyBars() {
  return (
    <div className="mt-5 flex min-h-[104px] flex-1 items-end justify-between gap-2">
      {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
        <div
          key={`${label}-${index}`}
          className="flex flex-col items-center gap-2 flex-1"
        >
          <div className="h-20 w-full rounded-sm bg-slate-50" />
          <span className="text-[10px] font-bold text-slate-300">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function getOrderedDays(days: FocusMomentumDay[]) {
  return [...days].sort((left, right) => left.date.localeCompare(right.date));
}

export function buildBarTitle(day: FocusMomentumDay) {
  return [
    `${day.day_label} - ${day.date}`,
    `Progress: ${day.percentage}%`,
    `Actions: ${day.total_actions}`,
    `Check-ins: ${day.sources.checkins.count}/${day.sources.checkins.target} (${day.sources.checkins.percentage}%)`,
    `Chat: ${day.sources.chat.count}/${day.sources.chat.target} (${day.sources.chat.percentage}%)`,
    `Journals: ${day.sources.journals.count}/${day.sources.journals.target} (${day.sources.journals.percentage}%)`,
    `Reframes: ${day.sources.reframes.count}/${day.sources.reframes.target} (${day.sources.reframes.percentage}%)`,
  ].join("\n");
}

export function isEmptyFocusMomentum(data: FocusMomentumResponse | null) {
  if (!data) return false;

  return (
    data.streak_days === 0 &&
    getOrderedDays(data.days).every((day) => day.percentage <= 0)
  );
}

function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
