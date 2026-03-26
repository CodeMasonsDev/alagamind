import {
  chat,
  createSession,
  deleteSession,
  GetChat,
  getSessionsByUser,
} from "@/api/chat-companion";
import {
  Chat_history,
  ChatRequest,
  ChatResponse,
  NewSessionResponse,
  UserSessionsResponse,
} from "@/types/ai-companion";

type HttpError = {
  response?: {
    status?: number;
  };
};

export async function sendChat(body: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await chat(body);

    if (!response) {
      throw new Error("Empty response. Please try again");
    }

    return response;
  } catch (error) {
    console.log("Submit answer failed to send data", error);
    throw new Error("Unable to submit your message. Please try again");
  }
}

export async function GetChats(
  session_id: string,
  user_id: string,
): Promise<Chat_history[]> {
  try {
    const response = await GetChat(session_id, user_id);

    if (!response) {
      return [];
    }

    return response.history;
  } catch (error: unknown) {
    const httpError = error as HttpError;

    if (httpError.response?.status === 404) {
      return [];
    }

    throw new Error("Unable to load chat history. Please try again");
  }
}

export async function createNewSession(): Promise<NewSessionResponse> {
  try {
    const response = await createSession();

    if (!response) {
      throw new Error("Empty response when creating session");
    }

    return response;
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

export async function fetchUserSessions(
  userId: string,
): Promise<UserSessionsResponse> {
  try {
    const response = await getSessionsByUser(userId);

    if (!response) {
      throw new Error("Empty response when fetching sessions");
    }

    return response;
  } catch (error) {
    console.log("Failed to fetch user sessions", error);
    throw new Error("Unable to load sessions. Please try again");
  }
}
