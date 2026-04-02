import axiosInstance from "@/lib/axios";
import { BASEURL } from "@/lib/base";

export type JournalSentimentSegment = {
  segment_id: number;
  position: number;
  text: string;
  sentiment: string;
  confidence: number;
};

type RawJournalSentimentSegment = {
  segment_id?: number;
  position?: number;
  text?: string | null;
  sentence?: string | null;
  sentiment?: string | null;
  confidence?: number | null;
};

type RawJournalSentimentResponse = {
  journal_id: string;
  user_id: string | null;
  segments: RawJournalSentimentSegment[];
};

export type JournalSentimentResponse = {
  journal_id: string;
  user_id: string | null;
  segments: JournalSentimentSegment[];
};

export type JournalRecommendedProtocol = {
  title: string;
  description: string;
  duration?: string;
  href?: string;
  reason?: string;
};

export type JournalSentimentPercentagesResponse = {
  journal_id: string;
  user_id: string | null;
  total_segments: number;
  counts: {
    negative: number;
    neutral: number;
    positive: number;
  };
  percentages: {
    negative: number;
    neutral: number;
    positive: number;
  };
  suggested_reframe?: string;
  recommended_protocol?: JournalRecommendedProtocol | null;
};

export type AnalyzeJournalSentimentPayload = {
  journal_id: string;
};

type JournalSentimentPercentagesOptions = {
  refresh?: boolean;
};

export async function analyzeJournalSentiment(
  payload: AnalyzeJournalSentimentPayload,
) {
  const response = await axiosInstance.post<RawJournalSentimentResponse>(
    `${BASEURL}api/journal/sentiment/analyze`,
    payload,
  );

  return normalizeJournalSentimentResponse(response.data);
}

export async function getJournalSentiment(journalId: string, userId: string) {
  void userId;

  const response = await axiosInstance.get<RawJournalSentimentResponse>(
    `${BASEURL}api/journal/sentiment/${journalId}`,
  );

  return normalizeJournalSentimentResponse(response.data);
}

export async function getJournalSentimentPercentages(
  journalId: string,
  userId: string,
  options?: JournalSentimentPercentagesOptions,
) {
  void userId;

  const response = await axiosInstance.get<JournalSentimentPercentagesResponse>(
    `${BASEURL}api/journal/sentiment/${journalId}/percentages`,
    {
      params: options?.refresh ? { refresh: true } : undefined,
    },
  );

  return response.data;
}

function normalizeJournalSentimentResponse(
  response: RawJournalSentimentResponse,
): JournalSentimentResponse {
  return {
    journal_id: response.journal_id,
    user_id: response.user_id,
    segments: Array.isArray(response.segments)
      ? response.segments.map(normalizeJournalSentimentSegment)
      : [],
  };
}

function normalizeJournalSentimentSegment(
  segment: RawJournalSentimentSegment,
): JournalSentimentSegment {
  return {
    segment_id: Number.isFinite(segment.segment_id) ? segment.segment_id : 0,
    position: Number.isFinite(segment.position) ? segment.position : 0,
    text: String(segment.text ?? segment.sentence ?? "").trim(),
    sentiment: String(segment.sentiment ?? "neutral"),
    confidence:
      typeof segment.confidence === "number" && Number.isFinite(segment.confidence)
        ? segment.confidence
        : 0,
  };
}
