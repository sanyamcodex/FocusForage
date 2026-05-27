import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { createMessage, ensureRoomMember } from "../services/room.service.js";

const presence = new Map();

const getRoomPresence = (roomId) => Array.from(presence.get(roomId)?.values() || []);

const addPresence = (roomId, user) => {
  if (!presence.has(roomId)) presence.set(roomId, new Map());
  presence.get(roomId).set(user.id, user);
};

const removePresence = (roomId, userId) => {
  const roomPresence = presence.get(roomId);
  if (!roomPresence) return;
  roomPresence.delete(userId);
  if (roomPresence.size === 0) presence.delete(roomId);
};

export const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing auth token"));
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.sub);
      if (!user) return next(new Error("Invalid auth token"));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("room:join", async ({ roomId }, ack) => {
      try {
        await ensureRoomMember(roomId, socket.user._id);
        socket.join(roomId);
        addPresence(roomId, {
          id: socket.user._id.toString(),
          name: socket.user.name,
          avatar: socket.user.avatar,
          socketId: socket.id
        });
        io.to(roomId).emit("presence:update", getRoomPresence(roomId));
        io.to(roomId).emit("room:notification", { message: `${socket.user.name} joined the room` });
        ack?.({ ok: true });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
      }
    });

    socket.on("room:leave", ({ roomId }) => {
      socket.leave(roomId);
      removePresence(roomId, socket.user._id.toString());
      io.to(roomId).emit("presence:update", getRoomPresence(roomId));
      io.to(roomId).emit("room:notification", { message: `${socket.user.name} left the room` });
    });

    socket.on("chat:send", async ({ roomId, body }, ack) => {
      try {
        const message = await createMessage(roomId, socket.user, body);
        io.to(roomId).emit("chat:new", message);
        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({ ok: false, message: error.message });
      }
    });

    socket.on("chat:typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("chat:typing", {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        isTyping
      });
    });

    socket.on("session:update", async ({ roomId, session }) => {
      socket.to(roomId).emit("session:update", session);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          removePresence(roomId, socket.user._id.toString());
          socket.to(roomId).emit("presence:update", getRoomPresence(roomId));
        }
      });
    });
  });
};

