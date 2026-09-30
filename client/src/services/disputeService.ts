import api from "../lib/api";

export interface Dispute {
  _id: string;
  bookingId: {
    _id: string;
    serviceDescription: string;
    requestedDate: string;
    status: string;
    customerId?: { name: string; email: string };
    providerId?: { category: string; userId?: { name: string; email: string } };
  };
  raisedBy: { _id: string; name: string; email: string };
  reason: string;
  description: string;
  status: "open" | "resolved" | "rejected";
  adminNote?: string;
  createdAt: string;
}

export const createDispute = (data: { bookingId: string; reason: string; description: string }) =>
  api.post<{ dispute: Dispute }>("/disputes", data).then((res) => res.data);

export const getMyDisputes = () =>
  api.get<{ disputes: Dispute[] }>("/disputes/my").then((res) => res.data);

export const getAllDisputes = () =>
  api.get<{ disputes: Dispute[] }>("/disputes").then((res) => res.data);

export const resolveDispute = (id: string, status: "resolved" | "rejected", adminNote?: string) =>
  api.put<{ dispute: Dispute }>(`/disputes/${id}`, { status, adminNote }).then((res) => res.data);
