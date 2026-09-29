import api from "../lib/api";

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export const submitContactForm = (data: ContactPayload) =>
  api.post<{ message: string }>("/contact", data).then((res) => res.data);
