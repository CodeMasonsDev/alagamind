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

export async function GetCurrentState(userId: string) {
  try {
    const res = await axiosInstance.get(
      `${BASEURLDOTNETAPI}api/MoodLog/GetCurrentState?userId=${userId}`,
    );

    if (!res) {
      console.log("Empty response");
      return null;
    }

    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
