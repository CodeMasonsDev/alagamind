import axiosInstance from "@/lib/axios";
import {
  ChatHistoryResponse,
  ChatRequest,
  ChatResponse,
  NewSessionResponse,
} from "@/types/ai-companion";

export async function chat({ user_message, session_id }: ChatRequest) {
  try {
    const response = await axiosInstance.post<ChatResponse>("api/chat/", {
      user_message,
      session_id,
    });

    if (!response.data) {
      console.log("Empty response");
    }

    return response.data;
  } catch (error) {
    throw new Error("Failed to generate response");
  }
}

export async function GetChat(session_id: string) {
  try {
    const response = await axiosInstance.get<ChatHistoryResponse>(
      `api/session/${session_id}`,
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
    const response = await axiosInstance.post<NewSessionResponse>(
      "api/session/new",
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to create session");
  }
}

export async function deleteSession(session_id: string) {
  try {
    await axiosInstance.delete(`api/session/${session_id}`);
  } catch (error) {
    throw new Error("Failed to delete session");
  }
}
