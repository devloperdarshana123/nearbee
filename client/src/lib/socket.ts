import { io, type Socket } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
