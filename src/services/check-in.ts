import { CreateCheckIn } from "@/api/check-in";

export async function submitCheckIn(
  userId: string,
  state: number,
  intensity: number,
) {
  try {
    const response = await CreateCheckIn({ userId, state, intensity });

    if (!response) {
      console.log("Empty response");
      return null;
    }

    return response;
  } catch (error) {
    console.error("Unable to submit check-in:", error);
    return null;
  }
}
