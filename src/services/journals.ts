import { Create, GetUserJournals, Update } from "@/api/journal";
import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";
import { UpdateJournal } from "@/types/journals";

export type CreateJournal = {
  userId: string;
  title: string;

  content: string;
};

export async function MakeJournal(payload: CreateJournal) {
  try {
    const response = await Create(payload);

    if (!response) {
      console.log("Empty response");
    }

    return response;
  } catch (error) {
    console.log("Unable to sumbit your journal");
  }
}

export async function updateJournal(updateJournal: UpdateJournal) {
  try {
    const response = await Update(updateJournal);

    if (!response) {
      console.log("Empty response");
    }

    return response;
  } catch (error) {
    console.log("Unable to update your journal");
  }
}
// src/services/journals.ts

export async function GetAllJournalsByUser(userId: string) {
  try {
    // Note: I matched the URL exactly to your Swagger screenshot (GetAllJournalByUser)
    const response = await axiosInstance.get(
      `${BASEURLDOTNETAPI}api/Journal/GetAllJournalByUser?userId=${userId}`,
    );

    if (!response || !response.data) {
      return [];
    }

    return response.data; // THIS is what gets mapped!
  } catch (error) {
    console.error("Unable to retrieve journals:", error);
    return []; // Return an empty array on error so .map() doesn't crash
  }
}
