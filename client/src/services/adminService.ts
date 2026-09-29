import api from "../lib/api";
import type { AdminUser, Booking, Provider, Review } from "../lib/types";

export const getUsers = (params?: { role?: string }) =>
  api.get<{ users: AdminUser[] }>("/admin/users", { params }).then((res) => res.data);

export const banUser = (id: string) =>
  api.put<{ user: AdminUser }>(`/admin/users/${id}/ban`).then((res) => res.data);

export const setProviderVerification = (id: string, isVerified: boolean) =>
  api
    .put<{ provider: Provider }>(`/admin/providers/${id}/verify`, { isVerified })
    .then((res) => res.data);

export const getAllBookings = (params?: { status?: string }) =>
  api.get<{ bookings: Booking[] }>("/admin/bookings", { params }).then((res) => res.data);

export const getPendingVerifications = () =>
  api.get<{ providers: Provider[] }>("/admin/verifications").then((res) => res.data);

export const getFlaggedReviews = () =>
  api.get<{ reviews: Review[] }>("/reviews/flagged").then((res) => res.data);

export const deleteReview = (id: string) =>
  api.delete<{ message: string }>(`/reviews/${id}`).then((res) => res.data);
