export type ChatRequest = {
  user_message: string;
  session_id: string;
};

export type ChatResponse = {
  response: string;
  session_id: string;
};

export type Chat_history = {
  user: string;
  ai: string;
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
