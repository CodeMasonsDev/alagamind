import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";

export type CheckInPayload = {
  userId: string;
  state: number;
  intensity: number;
};

export async function CreateCheckIn(payload: CheckInPayload) {
  try {
    const response = await axiosInstance.post(
      `${BASEURLDOTNETAPI}Check-in`,
      payload,
    );

    if (!response) {
      console.log("Empty response");
      return null;
    }

    return response.data;
  } catch (error) {
    console.log("Unable to submit check-in:", error);
    return null;
  }
}
