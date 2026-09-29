const { Server } = require("socket.io");
const { verifyToken, clerkClient } = require("@clerk/express");
const User = require("../models/User");

let io = null;

const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      },
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing auth token"));

      const { sub: clerkId } = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      let user = await User.findOne({ clerkId });
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        const name =
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          clerkUser.username ||
          "New User";
        user = await User.create({
          clerkId,
          name,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          referralCode: clerkId.slice(-8).toUpperCase(),
        });
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("chat:join", (bookingId) => {
      if (bookingId) socket.join(`booking:${bookingId}`);
    });

    socket.on("chat:leave", (bookingId) => {
      if (bookingId) socket.leave(`booking:${bookingId}`);
    });
  });

  return io;
};

const getIo = () => io;

const notifyUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, getIo, notifyUser };
