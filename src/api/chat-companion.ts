import axiosInstance from "@/lib/axios";
import {
  ChatHistoryResponse,
  ChatRequest,
  ChatResponse,
  NewSessionResponse,
  UserSessionsResponse,
  VoicePlaybackRequest,
} from "@/types/ai-companion";

type ChatStreamEventMap = {
  stage: { stage: string; session_id?: string; user_id?: string };
  delta: { text: string };
  replace: { text: string };
  done: ChatResponse;
  error: { detail?: string };
};

type ChatStreamHandlers = {
  onStage?: (payload: ChatStreamEventMap["stage"]) => void;
  onDelta?: (payload: ChatStreamEventMap["delta"]) => void;
  onReplace?: (payload: ChatStreamEventMap["replace"]) => void;
  onDone?: (payload: ChatStreamEventMap["done"]) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeStreamTextFragment(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  if (/^"?response"?\s*:?\s*$/i.test(trimmed)) {
    return "";
  }

  if (/^[{}\[\]",:]+$/.test(trimmed)) {
    return "";
  }

  if (
    (trimmed.startsWith("{{") && trimmed.endsWith("}}")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    const inner = trimmed.replace(/^\{+|\}+$/g, "").replace(/^\[+|\]+$/g, "");
    if (inner && !inner.includes(":")) {
      return inner.trim();
    }
  }

  return text
    .replace(/^\s*[{[]+\s*/, "")
    .replace(/\s*[}\]]+\s*$/, "")
    .replace(/^\s*"(?:response|text|content|delta|message)"\s*:\s*/i, "")
    .replace(/^\s*(?:response|text|content|delta|message)\s*:\s*/i, "");
}

function extractStreamText(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();

    const parseCandidates = [
      trimmed,
      trimmed.replace(/^\{\{/, "{").replace(/\}\}$/, "}"),
      trimmed.replace(/^"+|"+$/g, ""),
    ];

    for (const candidate of parseCandidates) {
      if (
        !candidate ||
        (!candidate.startsWith("{") && !candidate.startsWith("["))
      ) {
        continue;
      }

      try {
        return extractStreamText(JSON.parse(candidate));
      } catch {
        continue;
      }
    }

    const textMatch = trimmed.match(
      /"(?:text|response|content|delta|message)"\s*:\s*"([^"]*)"/,
    );
    if (textMatch) {
      return sanitizeStreamTextFragment(textMatch[1]);
    }

    return sanitizeStreamTextFragment(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => extractStreamText(item)).join("");
  }

  if (!isRecord(value)) {
    return "";
  }

  const directKeys = ["text", "response", "content", "delta", "message"];
  for (const key of directKeys) {
    const candidate = value[key];
    if (typeof candidate !== "undefined") {
      const extracted = extractStreamText(candidate);
      if (extracted) {
        return extracted;
      }
    }
  }

  if (Array.isArray(value.choices)) {
    const extracted = extractStreamText(value.choices);
    if (extracted) {
      return extracted;
    }
  }

  return "";
}

function normalizeDonePayload(payload: unknown): ChatResponse {
  if (!isRecord(payload)) {
    return {
      response: extractStreamText(payload),
      session_id: "",
    };
  }

  return {
    response: extractStreamText(payload.response ?? payload),
    session_id:
      typeof payload.session_id === "string" ? payload.session_id : "",
    user_id: typeof payload.user_id === "string" ? payload.user_id : undefined,
    language_preference:
      payload.language_preference === "auto" ||
      payload.language_preference === "english" ||
      payload.language_preference === "bisaya" ||
      payload.language_preference === "tagalog"
        ? payload.language_preference
        : undefined,
    language:
      typeof payload.language === "string" ? payload.language : undefined,
    emotion:
      typeof payload.emotion === "string" || payload.emotion === null
        ? payload.emotion
        : undefined,
    problem:
      typeof payload.problem === "string" || payload.problem === null
        ? payload.problem
        : undefined,
  };
}

function dispatchChatStreamEvent(
  eventName: string,
  payload: unknown,
  handlers: ChatStreamHandlers,
) {
  switch (eventName) {
    case "stage":
      handlers.onStage?.(payload as ChatStreamEventMap["stage"]);
      return;
    case "delta":
      handlers.onDelta?.({ text: extractStreamText(payload) });
      return;
    case "replace":
      handlers.onReplace?.({ text: extractStreamText(payload) });
      return;
    case "done":
      handlers.onDone?.(normalizeDonePayload(payload));
      return;
    case "error": {
      const detail =
        (payload as ChatStreamEventMap["error"])?.detail ??
        "Failed to generate response";
      throw new Error(detail);
    }
    default:
      return;
  }
}

function processSseChunk(rawChunk: string, handlers: ChatStreamHandlers) {
  const lines = rawChunk.split(/\r?\n/);
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) {
    return;
  }

  const payload = JSON.parse(dataLines.join("\n"));
  dispatchChatStreamEvent(eventName, payload, handlers);
}

function findSseEventBoundary(buffer: string) {
  const windowsBoundaryIndex = buffer.indexOf("\r\n\r\n");
  const unixBoundaryIndex = buffer.indexOf("\n\n");

  if (windowsBoundaryIndex === -1) {
    return unixBoundaryIndex;
  }

  if (unixBoundaryIndex === -1) {
    return windowsBoundaryIndex;
  }

  return Math.min(windowsBoundaryIndex, unixBoundaryIndex);
}

export async function chat({
  user_message,
  session_id,
  user_id,
  language_preference = "auto",
}: ChatRequest) {
  try {
    const response = await axiosInstance.post<ChatResponse>("api/chat/", {
      user_message,
      session_id,
      user_id,
      language_preference,
    });

    if (!response.data) {
      console.log("Empty response");
    }

    return response.data;
  } catch {
    throw new Error("Failed to generate response");
  }
}

export async function chatStream(
  {
    user_message,
    session_id,
    user_id,
    language_preference = "auto",
  }: ChatRequest,
  handlers: ChatStreamHandlers,
) {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      user_message,
      session_id,
      user_id,
      language_preference,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to generate response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const separatorIndex = findSseEventBoundary(buffer);
      if (separatorIndex === -1) {
        break;
      }

      const rawChunk = buffer.slice(0, separatorIndex).trim();
      const separatorLength = buffer.startsWith("\r\n\r\n", separatorIndex)
        ? 4
        : 2;
      buffer = buffer.slice(separatorIndex + separatorLength);

      if (!rawChunk) {
        continue;
      }

      processSseChunk(rawChunk, handlers);
    }
  }

  buffer += decoder.decode();

  const trailingChunk = buffer.trim();
  if (trailingChunk) {
    processSseChunk(trailingChunk, handlers);
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

export async function synthesizeAssistantVoice({
  text,
  language,
}: VoicePlaybackRequest) {
  const response = await fetch("/api/tts/deepgram", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to synthesize voice");
  }

  return response.arrayBuffer();
}
