import axiosInstance from "@/lib/axios";

export type FocusMomentumSourceStats = {
  count: number;
  target: number;
  percentage: number;
};

export type FocusMomentumSourceBreakdown = {
  checkins: FocusMomentumSourceStats;
  chat: FocusMomentumSourceStats;
  journals: FocusMomentumSourceStats;
  reframes: FocusMomentumSourceStats;
};

export type FocusMomentumDay = {
  date: string;
  day_key: string;
  day_label: string;
  percentage: number;
  total_actions: number;
  sources: FocusMomentumSourceBreakdown;
};

export type FocusMomentumResponse = {
  user_id: string;
  streak_days: number;
  week_start: string;
  week_end: string;
  today_percentage: number;
  weekly_average_percentage: number;
  days: FocusMomentumDay[];
  weekly_totals: {
    checkins: number;
    chat: number;
    journals: number;
    reframes: number;
  };
  source_targets: {
    checkins: number;
    chat: number;
    journals: number;
    reframes: number;
  };
};

export async function getFocusMomentum(
  userId: string,
): Promise<FocusMomentumResponse | null> {
  try {
    const response = await axiosInstance.get<FocusMomentumResponse>(
      "api/focus-momentum",
      {
        params: {
          user_id: userId,
        },
      },
    );

    if (!response.data) {
      console.log("Empty focus momentum response");
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Unable to fetch focus momentum:", error);
    return null;
  }
}
