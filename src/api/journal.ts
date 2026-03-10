import axiosInstance from "@/lib/axios";
import { BASEURLDOTNETAPI } from "@/lib/base";

export type CreateJournal = {
  userId: string;
  title: string;

  content: string;
};

export type UpdateJournalPayload = {
  userId: string;
  journalId: string;
  title: string;
  content: string;
};

export type DeleteJournal = {
  userId: string;
  journalId: string;
};

// --- CREATE ---
export async function Create(payload: CreateJournal) {
  try {
    const response = await axiosInstance.post(
      `${BASEURLDOTNETAPI}api/Journal/CreateJournal`,
      payload,
    );

    if (!response) {
      console.log("Empty response");
      return null;
    }

    return response.data;
  } catch (error) {
    console.log("Unable to submit your journal:", error);
    throw error;
  }
}

// --- UPDATE ---
export async function Update(payload: UpdateJournalPayload) {
  try {
    const response = await axiosInstance.put(
      `${BASEURLDOTNETAPI}api/Journal/UpdateJournal`,
      payload,
    );

    if (!response) {
      console.log("Empty response");
      return null;
    }

    return response.data;
  } catch (error) {
    console.log("Unable to update your journal:", error);
    throw error;
  }
}

export async function GetUserJournals(user_id: string) {
  try {
    const response = await axiosInstance.get(
      `${BASEURLDOTNETAPI}api/Journal/GetAllJournalByUser?userId=${user_id}`,
    );

    if (!response) {
      console.log("Empty response");
    }

    return response.data;
  } catch (error) {
    console.log("Unable to retrieve your journals");
  }
}

export async function GetUserJournal(user_id: string, journal_id: string) {
  try {
    const response = await axiosInstance.get(
      `${BASEURLDOTNETAPI}api/Journal/GetJournalById?userId=${user_id}&journalId=${journal_id}`,
    );

    if (!response) {
      console.log("Empty response");
    }

    return response.data;
  } catch (error) {
    console.log("Unable to retrieve your journals");
  }
}

export async function DeleteJournal({ userId, journalId }: DeleteJournal) {
  try {
    const response = await axiosInstance.delete(
      `${BASEURLDOTNETAPI}api/Journal/DeleteJournalId?userId=${userId}&journalId=${journalId}`,
    );

    if (!response) {
      console.log("empty response");
      return null;
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
}
