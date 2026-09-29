import api from "../lib/api";

export interface ChatMessage {
  _id: string;
  bookingId: string;
  senderId: { _id: string; name: string };
  text: string;
  createdAt: string;
}

export const getMessages = (bookingId: string) =>
  api.get<{ messages: ChatMessage[] }>(`/messages/${bookingId}`).then((res) => res.data);

export const sendMessage = (bookingId: string, text: string) =>
  api.post<{ message: ChatMessage }>(`/messages/${bookingId}`, { text }).then((res) => res.data);
