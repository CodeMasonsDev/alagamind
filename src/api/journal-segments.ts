import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";

export type GenerateJournalSegmentsPayload = {
  journalEntryId: string;
  content: string;
};

export async function generateJournalSegments(
  payload: GenerateJournalSegmentsPayload,
) {
  const response = await axiosInstance.post(
    `${BASEURLDOTNETAPI}api/JournalSegment/GenerateSegments`,
    payload,
  );

  return response.data;
}
