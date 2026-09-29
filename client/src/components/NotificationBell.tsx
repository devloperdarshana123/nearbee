import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  markNotificationsRead,
  type AppNotification,
} from "../services/notificationService";
import { getSocket } from "../lib/socket";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const boxRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (notification: AppNotification) => {
      queryClient.setQueryData<{ notifications: AppNotification[]; unreadCount: number }>(
        ["notifications"],
        (prev) =>
          prev
            ? { notifications: [notification, ...prev.notifications], unreadCount: prev.unreadCount + 1 }
            : { notifications: [notification], unreadCount: 1 },
      );
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      markNotificationsRead().then(() =>
        queryClient.setQueryData<{ notifications: AppNotification[]; unreadCount: number }>(
          ["notifications"],
          (prev) => (prev ? { ...prev, unreadCount: 0 } : prev),
        ),
      );
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-[var(--chip-bg)]"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_40px_rgba(23,58,64,0.16)]">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-center text-sm text-[var(--sea-ink-soft)]">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <a
                key={n._id}
                href={n.link || "/"}
                onClick={() => setOpen(false)}
                className={`block border-b border-[var(--line)] px-4 py-3 text-sm no-underline transition last:border-0 hover:bg-[var(--chip-bg)] ${
                  n.read ? "text-[var(--sea-ink-soft)]" : "font-medium text-[var(--sea-ink)]"
                }`}
              >
                {n.message}
                <div className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
