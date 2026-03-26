import axiosInstance from "@/lib/axios";
import {
  ChatHistoryResponse,
  ChatRequest,
  ChatResponse,
  NewSessionResponse,
  UserSessionsResponse,
} from "@/types/ai-companion";

export async function chat({ user_message, session_id, user_id }: ChatRequest) {
  try {
    const response = await axiosInstance.post<ChatResponse>("api/chat/", {
      user_message,
      session_id,
      user_id,
    });

    if (!response.data) {
      console.log("Empty response");
    }

    return response.data;
  } catch {
    throw new Error("Failed to generate response");
  }
}

export async function GetChat(session_id: string, user_id: string) {
  try {
    const response = await axiosInstance.get<ChatHistoryResponse>(
      `api/session/${session_id}`,
      { params: { user_id } },
    );

    if (!response.data) {
      console.log("Empty response");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createSession() {
  try {
    const response =
      await axiosInstance.post<NewSessionResponse>("api/session/new");
    return response.data;
  } catch {
    throw new Error("Failed to create session");
  }
}

export async function deleteSession(session_id: string) {
  try {
    await axiosInstance.delete(`api/session/${session_id}`);
  } catch {
    throw new Error("Failed to delete session");
  }
}

export async function getSessionsByUser(userId: string) {
  try {
    const response = await axiosInstance.get<UserSessionsResponse>(
      "api/sessions/by-user",
      { params: { user_id: userId } },
    );
    return response.data;
  } catch {
    throw new Error("Failed to fetch user sessions");
  }
}
