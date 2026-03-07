import {
  chat,
  GetChat,
  createSession,
  deleteSession,
} from "@/api/chat-companion";
import {
  Chat_history,
  ChatHistoryResponse,
  ChatRequest,
  ChatResponse,
  NewSessionResponse,
} from "@/types/ai-companion";

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

export async function createNewSession(): Promise<NewSessionResponse> {
  try {
    const res = await createSession();
    if (!res) {
      throw new Error("Empty response when creating session");
    }
    return res;
  } catch (error) {
    console.log("Failed to create new session", error);
    throw new Error("Unable to create a new session. Please try again");
  }
}

export async function removeSession(session_id: string): Promise<void> {
  try {
    await deleteSession(session_id);
  } catch (error) {
    console.log("Failed to delete session", error);
    throw new Error("Unable to delete session. Please try again");
  }
}
