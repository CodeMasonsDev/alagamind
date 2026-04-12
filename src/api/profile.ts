import axiosInstance from "@/lib/axios";
import { BASEURL } from "@/lib/base";

export type ProfileOverviewSummarySection = {
  title: string;
  content: string;
  flag: string | null;
};

export type ProfileOverviewSummaryInsights = {
  generated_at: string;
  sections: ProfileOverviewSummarySection[];
  overall_tone: string;
  recommended_companion_approach: string;
};

export type ProfileOverviewSummaryResponse = {
  insights: ProfileOverviewSummaryInsights | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeSection(value: unknown): ProfileOverviewSummarySection {
  const section = isRecord(value) ? value : {};

  return {
    title: asString(section.title),
    content: asString(section.content),
    flag: asNullableString(section.flag),
  };
}

function normalizeProfileOverviewSummary(
  value: unknown,
): ProfileOverviewSummaryResponse {
  if (!isRecord(value) || !isRecord(value.insights)) {
    return { insights: null };
  }

  const insights = value.insights;
  const sections = Array.isArray(insights.sections)
    ? insights.sections.map(normalizeSection)
    : [];

  return {
    insights: {
      generated_at: asString(insights.generated_at),
      sections,
      overall_tone: asString(insights.overall_tone),
      recommended_companion_approach: asString(
        insights.recommended_companion_approach,
      ),
    },
  };
}

export async function getProfileOverviewSummary(userId: string) {
  const response = await axiosInstance.post(
    `${BASEURL}api/profile/overview-summary`,
    {
      user_id: userId,
    },
  );

  return normalizeProfileOverviewSummary(response.data);
}
