import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";
import { BoxBreathPayload } from "@/types/BoxBreathPayload";
import { CognitiveReframingPayload } from "@/types/cognitive-reframing";
import { ApiResponse } from "@/types/response";
import { CognitiveReframingOverviewSummary } from "@/components/features/cognitive-reframing/types";

export const createBoxBreath = async (
  payload: BoxBreathPayload,
): Promise<ApiResponse<unknown>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      `${BASEURLDOTNETAPI}api/BoxBreathing/CreateBoxBreathing`,
      payload,
    );

    if (!response) console.log("failed to save box breathing");
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };

    console.error("CreateBoxBreath Error:", {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      payloadSent: payload,
    });
    throw error;
  }
};

export const createCognitiveReframing = async (
  payload: CognitiveReframingPayload,
): Promise<ApiResponse<CognitiveReframingOverviewSummary>> => {
  try {
    const response = await axiosInstance.post<
      ApiResponse<CognitiveReframingOverviewSummary>
    >(
      `${BASEURLDOTNETAPI}api/CognitiveReframing/CreateCognitiveReframing`,
      payload,
    );

    if (!response) console.log("Failed to save cognitive reframe");

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };

    console.error("CreateCognitiveReframing Error:", {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      payloadSent: payload,
    });
    throw error;
  }
};
