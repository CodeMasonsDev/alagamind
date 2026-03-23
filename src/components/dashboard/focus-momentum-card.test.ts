import assert from "node:assert/strict";
import test from "node:test";
import type { FocusMomentumDay, FocusMomentumResponse } from "@/api/focus-momentum";
import {
  buildBarTitle,
  clampPercentage,
  getOrderedDays,
  isEmptyFocusMomentum,
} from "@/components/dashboard/focus-momentum-card";

const sampleDay: FocusMomentumDay = {
  date: "2026-03-23",
  day_key: "M",
  day_label: "Mon",
  percentage: 50,
  total_actions: 3,
  sources: {
    checkins: { count: 1, target: 1, percentage: 25 },
    chat: { count: 1, target: 4, percentage: 6 },
    journals: { count: 1, target: 1, percentage: 25 },
    reframes: { count: 0, target: 2, percentage: 0 },
  },
};

test("clampPercentage limits visual bar values without changing source data", () => {
  assert.equal(clampPercentage(-8), 0);
  assert.equal(clampPercentage(48), 48);
  assert.equal(clampPercentage(135), 100);
});

test("getOrderedDays keeps the week in ascending date order", () => {
  const ordered = getOrderedDays([
    { ...sampleDay, date: "2026-03-25", day_key: "W", day_label: "Wed" },
    sampleDay,
    { ...sampleDay, date: "2026-03-24", day_key: "T", day_label: "Tue" },
  ]);

  assert.deepEqual(
    ordered.map((day) => day.date),
    ["2026-03-23", "2026-03-24", "2026-03-25"],
  );
});

test("buildBarTitle includes daily percentage, total actions, and source breakdown", () => {
  const title = buildBarTitle(sampleDay);

  assert.match(title, /Mon - 2026-03-23/);
  assert.match(title, /Progress: 50%/);
  assert.match(title, /Actions: 3/);
  assert.match(title, /Check-ins: 1\/1 \(25%\)/);
  assert.match(title, /Chat: 1\/4 \(6%\)/);
  assert.match(title, /Journals: 1\/1 \(25%\)/);
  assert.match(title, /Reframes: 0\/2 \(0%\)/);
});

test("isEmptyFocusMomentum detects a zero-activity backend payload safely", () => {
  const emptyPayload: FocusMomentumResponse = {
    user_id: "user-1",
    streak_days: 0,
    week_start: "2026-03-23",
    week_end: "2026-03-29",
    today_percentage: 0,
    weekly_average_percentage: 0,
    days: Array.from({ length: 7 }).map((_, index) => ({
      ...sampleDay,
      date: `2026-03-${23 + index}`,
      percentage: 0,
      total_actions: 0,
      sources: {
        checkins: { count: 0, target: 1, percentage: 0 },
        chat: { count: 0, target: 4, percentage: 0 },
        journals: { count: 0, target: 1, percentage: 0 },
        reframes: { count: 0, target: 2, percentage: 0 },
      },
    })),
    weekly_totals: {
      checkins: 0,
      chat: 0,
      journals: 0,
      reframes: 0,
    },
    source_targets: {
      checkins: 1,
      chat: 4,
      journals: 1,
      reframes: 2,
    },
  };

  assert.equal(isEmptyFocusMomentum(emptyPayload), true);
  assert.equal(
    isEmptyFocusMomentum({
      ...emptyPayload,
      streak_days: 2,
    }),
    false,
  );
});
