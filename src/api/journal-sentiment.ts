import axiosInstance from "@/lib/axios";
import { BASEURL } from "@/lib/base";

export type AnalyzeJournalSentimentPayload = {
  user_id: string;
  journal_id: string;
  content: string;
  created_at: string;
};

export type JournalSentimentSegment = {
  segment_id: number;
  position: number;
  text: string;
  sentiment: string;
  confidence: number;
};

export type JournalSentimentResponse = {
  journal_id: string;
  user_id: string;
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
  user_id: string;
  total_slots: number;
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

export async function analyzeJournalSentiment(
  payload: AnalyzeJournalSentimentPayload,
) {
  const response = await axiosInstance.post<JournalSentimentResponse>(
    `${BASEURL}api/journal/sentiment/analyze`,
    payload,
  );

  return response.data;
}

export async function getJournalSentiment(
  journalId: string,
  userId: string,
) {
  const response = await axiosInstance.get<JournalSentimentResponse>(
    `${BASEURL}api/journal/sentiment/${journalId}?user_id=${userId}`,
  );

  return response.data;
}

export async function getJournalSentimentPercentages(
  journalId: string,
  userId: string,
) {
  const response = await axiosInstance.get<JournalSentimentPercentagesResponse>(
    `${BASEURL}api/journal/sentiment/${journalId}/percentages?user_id=${userId}`,
  );

  return response.data;
}
