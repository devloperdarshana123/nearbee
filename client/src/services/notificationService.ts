import api from "../lib/api";

export interface AppNotification {
  _id: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export const getMyNotifications = () =>
  api
    .get<{ notifications: AppNotification[]; unreadCount: number }>("/notifications")
    .then((res) => res.data);

export const markNotificationsRead = () =>
  api.put<{ message: string }>("/notifications/read").then((res) => res.data);
