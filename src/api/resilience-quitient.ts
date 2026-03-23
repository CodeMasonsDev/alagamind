import axiosInstance from "@/lib/axios";

type ResilienceRQProps = {
  userId: string;
  trigger_source: "journal" | "reframe" | "checkin";
};

type RQBreakdownSection = {
  points: number;
  max_points: number;
  subscores: Record<string, number>;
  metrics: Record<string, number | string | null>;
};

export type ResilienceQuotientResponse = {
  user_id: string;
  score: number;
  raw_score: number;
  max_raw: number;
  breakdown: {
    journal: RQBreakdownSection;
    reframing: RQBreakdownSection;
    checkin: RQBreakdownSection;
    totals: {
      raw_score: number;
      max_raw: number;
      score: number;
    };
  };
  source_snapshot: {
    journal: Record<string, unknown>;
    reframing: Record<string, unknown>;
    checkin: Record<string, unknown>;
    trigger_source?: string;
  };
  calculated_at: string;
  deferred_components: string[];
};

export const calculateRQ = async (
  body: ResilienceRQProps,
): Promise<ResilienceQuotientResponse | null> => {
  const res = await axiosInstance.post<ResilienceQuotientResponse>(
    "api/rq/calculate",
    null,
    {
      params: {
        user_id: body.userId,
        trigger_source: body.trigger_source,
      },
    },
  );

  if (res.data == null) {
    console.log("empty response");
    return null;
  }

  return res.data;
};

type ResilienceRQScoreProps = {
  userId: string;
  refresh: boolean;
};

export const getQuotientResilienceScore = async (
  body: ResilienceRQScoreProps,
): Promise<ResilienceQuotientResponse | null> => {
  const res = await axiosInstance.get<ResilienceQuotientResponse>("api/rq", {
    params: {
      user_id: body.userId,
      refresh: body.refresh,
    },
  });

  if (res.data == null) {
    console.log("empty response");
    return null;
  }

  return res.data;
};

export function getResilienceProgressPercent(
  data: ResilienceQuotientResponse | null,
) {
  if (!data) return 0;

  const safeMaxRaw = data.breakdown?.totals?.max_raw ?? data.max_raw;
  const safeRawScore = data.breakdown?.totals?.raw_score ?? data.raw_score;

  if (!safeMaxRaw) return 0;

  return Math.max(
    0,
    Math.min(100, Math.round((safeRawScore / safeMaxRaw) * 100)),
  );
}

export function getResilienceTier(score: number) {
  if (score >= 80) {
    return {
      ring: "text-teal-500",
      accent: "bg-teal-400",
      soft: "bg-teal-50 text-teal-700",
      glow: "bg-teal-100",
      surface: "border-teal-100 bg-gradient-to-b from-teal-50/70 via-white to-white",
      icon: "text-teal-300",
      label: "High Resilience",
    };
  }

  if (score >= 60) {
    return {
      ring: "text-emerald-500",
      accent: "bg-emerald-400",
      soft: "bg-emerald-50 text-emerald-700",
      glow: "bg-emerald-100",
      surface:
        "border-emerald-100 bg-gradient-to-b from-emerald-50/70 via-white to-white",
      icon: "text-emerald-300",
      label: "Steady Capacity",
    };
  }

  if (score >= 40) {
    return {
      ring: "text-amber-500",
      accent: "bg-amber-400",
      soft: "bg-amber-50 text-amber-700",
      glow: "bg-amber-100",
      surface: "border-amber-100 bg-gradient-to-b from-amber-50/70 via-white to-white",
      icon: "text-amber-300",
      label: "Building Capacity",
    };
  }

  return {
    ring: "text-rose-500",
    accent: "bg-rose-400",
    soft: "bg-rose-50 text-rose-700",
    glow: "bg-rose-100",
    surface: "border-rose-100 bg-gradient-to-b from-rose-50/70 via-white to-white",
    icon: "text-rose-300",
    label: "Needs Reinforcement",
  };
}

export function formatResilienceUpdate(value?: string) {
  if (!value) return "Updated recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated recently";

  return `Updated ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}
