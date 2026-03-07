import axiosInstance from "@/lib/axios";
import { ChatHistoryResponse, ChatRequest, ChatResponse } from "@/types/ai-companion";

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
