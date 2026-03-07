import { chat, GetChat } from "@/api/chat-companion";
import { Chat_history, ChatHistoryResponse, ChatRequest, ChatResponse } from "@/types/ai-companion";

export async function sendChat(body: ChatRequest): Promise<ChatResponse> {
  try {
    const res = await chat(body);

    if (!res) {
      throw new Error("Empty response. Please try again");
    }
    return res;
  } catch (error) {
    console.log("Submit answer failed to send data", error);
    throw new Error("Unable to submit your message. Please try again");
  }
}

export async function GetChats(session_id: string): Promise<Chat_history[]> {
  try {
    const res = await GetChat(session_id);

    if (!res) return [];

    return res.history;
  } catch (error: any) {
    // 404 means the session doesn't exist yet — treat as empty history
    if (error?.response?.status === 404) return [];
    throw new Error("Unable to load chat history. Please try again");
  }
}
