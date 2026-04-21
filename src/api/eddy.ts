import { BASEURL } from "@/lib/base";

export interface EddyConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export type EddyLanguage = "en" | "tl" | "ceb";

export interface EddyAskParams {
  user_id: string;
  selected_text: string;
  user_question: string;
  language: EddyLanguage;
  full_journal_text: string;
  conversation_history: EddyConversationTurn[];
}

export async function askEddy(
  params: EddyAskParams,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${BASEURL}api/eddy/ask/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data) continue;
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data) as { chunk?: string; text?: string; content?: string };
          const chunk = parsed.chunk ?? parsed.text ?? parsed.content;
          if (chunk) onChunk(chunk);
        } catch {
          // backend sent plain text, use it directly
          onChunk(data);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
