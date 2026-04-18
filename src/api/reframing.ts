import axiosInstance from "@/lib/axios";
import { BASEURL } from "@/lib/base";
import { isAxiosError } from "axios";
import { CognitiveReframingOverviewSummary } from "@/components/features/cognitive-reframing/types";

export type CognitiveReframingOverviewPayload = {
  automatic_thought: string;
  cognitive_distortion: string;
  distress_intensity: number;
  evidence_supporting_thought: string;
  evidence_against_thought: string;
  balanced_thought: string;
};

export type GroundingSensoryAnchorPayload = {
  see: string[];
  touch: string[];
  hear: string[];
  smell: string[];
  taste: string[];
};

export type GroundingSensoryAnchorResponse = {
  grounding_summarry: string;
};

export type AnalyzeJournalPayload = {
  userId: string;
  journalId: string;
  content: string;
};

export type ApiThought = {
  thought_id: number;
  text: string;
  distortion: string;
  confidence: number;
  position: number;
  created_at: string;
  context_note: string;
  journal_id: string;
};

export type GeneratedReframe = {
  id: "logical" | "compassionate" | "direct";
  title: string;
  tone: string;
  text: string;
};

export type GenerateReframesPayload = {
  thought_id: number;
};

export type GenerateReframesResponse = {
  thought_id: number;
  thought_text: string;
  reframes: GeneratedReframe[];
};

export type SaveGeneratedReframePayload = {
  user_id: string;
  thought_id: number;
  style: string;
  text: string;
  corrected_distortion: string;
};

export type ApiSavedReframe = {
  reframe_id: number;
  thought_id: number;
  thought_text: string;
  distortion: string;
  style: string;
  text: string;
  created_at: string;
};

export type DetectedPattern = {
  type: string;
  title: string;
  share: number;
  count: number;
  severity: string | null;
  window: string | null;
  keywords: string[] | string | null;
};

export type DistortionBreakdown = Record<string, number>;

export type InsightsResponse = {
  detected_patterns: DetectedPattern[];
  distortion_breakdown: DistortionBreakdown;
};

export async function AnalyzeJournal(payload: AnalyzeJournalPayload) {
  const response = await axiosInstance.post(`${BASEURL}api/journal/analyze`, {
    user_id: payload.userId,
    journal_id: payload.journalId,
    content: payload.content,
  });

  return response.data;
}

export async function fetchThoughtsByUsers(userId: string) {
  try {
    const response = await axiosInstance.get<ApiThought[]>(
      `${BASEURL}api/thoughts/by-user`,
      {
        params: {
          user_id: userId,
        },
      },
    );

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // Backend returns 400 or 404 when no thoughts exist — treat as empty
    if (isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 404)) {
      return [];
    }
    throw error;
  }
}

export async function generateReframes(payload: GenerateReframesPayload) {
  const response = await axiosInstance.post<GenerateReframesResponse>(
    `${BASEURL}api/reframes/generate`,
    {
      thought_id: payload.thought_id,
    },
  );

  return response.data;
}

export async function saveGeneratedReframeThought(
  payload: SaveGeneratedReframePayload,
) {
  const response = await axiosInstance.post<ApiSavedReframe[]>(
    `${BASEURL}api/reframes/save`,
    {
      user_id: payload.user_id,
      thought_id: payload.thought_id,
      style: payload.style,
      text: payload.text,
      corrected_distortion: payload.corrected_distortion,
    },
  );

  return Array.isArray(response.data) ? response.data : [];
}

export async function getSaveReframe(userId: string) {
  const response = await axiosInstance.get<ApiSavedReframe[]>(
    `${BASEURL}api/reframes/by-user`,
    {
      params: {
        user_id: userId,
      },
    },
  );

  return Array.isArray(response.data) ? response.data : [];
}

export async function getInsights(userId: string) {
  const response = await axiosInstance.get<InsightsResponse>(
    `${BASEURL}api/insights`,
    {
      params: {
        user_id: userId,
      },
    },
  );

  return response.data;
}

export async function getCognitiveReframingOverview(
  payload: CognitiveReframingOverviewPayload,
) {
  const response = await axiosInstance.post<CognitiveReframingOverviewSummary>(
    `${BASEURL}cognitive_reframing_overview`,
    payload,
  );

  return response.data;
}

export async function getGroundingSensoryAnchor(
  payload: GroundingSensoryAnchorPayload,
) {
  const response = await axiosInstance.post<GroundingSensoryAnchorResponse>(
    `${BASEURL}grounding_sensory_anchor`,
    payload,
  );

  return response.data;
}
