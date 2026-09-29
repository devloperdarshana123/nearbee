import api from "../lib/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const sendChatMessage = (messages: ChatMessage[]) =>
  api.post<{ reply: string }>("/chat", { messages }).then((res) => res.data);
