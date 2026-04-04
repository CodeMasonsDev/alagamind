import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";
import { BoxBreathPayload } from "@/types/BoxBreathPayload";
import { ApiResponse } from "@/types/response";

export const createBoxBreath = async (
  payload: BoxBreathPayload,
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<any>>(
      `${BASEURLDOTNETAPI}api/BoxBreathing/CreateBoxBreathing`,
      payload,
    );

    if (!response) console.log("failed to save box breathing");
    return response.data;
  } catch (error: any) {
    console.error("CreateBoxBreath Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      payloadSent: payload,
    });
    throw error;
  }
};
