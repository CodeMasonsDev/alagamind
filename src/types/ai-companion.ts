export type LanguagePreference =
  | "auto"
  | "english"
  | "bisaya"
  | "tagalog";

export type ChatRequest = {
  user_message: string;
  session_id?: string;
  user_id?: string;
  language_preference?: LanguagePreference;
};

export type ChatResponse = {
  response: string;
  session_id: string;
  user_id?: string;
  language?: string;
  language_preference?: LanguagePreference;
  emotion?: string | null;
  problem?: string | null;
};

export type Chat_history = {
  user: string;
  ai: string;
  emotion?: string | null;
  problem?: string | null;
  language?: string | null;
  language_preference?: LanguagePreference;
};

export type ChatHistoryResponse = {
  session_id: string;
  history: Chat_history[];
};

export type NewSessionResponse = {
  session_id: string;
  message: string;
};

export type SessionListItem = {
  id: string;
  label: string;
  createdAt: string;
};

export type SessionTurn = {
  user: string;
  ai: string;
  emotion?: string | null;
  problem?: string | null;
  language?: string | null;
  language_preference?: LanguagePreference;
  timestamp: string;
};

export type UserSession = {
  session_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  turn_count: number;
  history: SessionTurn[];
};

export type UserSessionsResponse = {
  user_id: string;
  sessions: UserSession[];
};

export type VoicePlaybackRequest = {
  text: string;
  language?: string | null;
};
