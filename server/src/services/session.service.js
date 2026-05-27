import { ActivityLog } from "../models/ActivityLog.js";
import { StudyRoom } from "../models/StudyRoom.js";
import { StudySession } from "../models/StudySession.js";
import { AppError } from "../utils/AppError.js";
import { ensureRoomMember } from "./room.service.js";

export const startSession = async (roomId, user, payload = {}) => {
  const room = await ensureRoomMember(roomId, user._id);
  if (room.activeSession) throw new AppError("A session is already active in this room", 409);

  const durationSeconds = Number(payload.durationSeconds || 1500);
  const session = await StudySession.create({
    room: room._id,
    user: user._id,
    mode: payload.mode || "pomodoro",
    durationSeconds,
    remainingSeconds: durationSeconds,
    participants: [user._id]
  });

  room.activeSession = session._id;
  await room.save();
  await ActivityLog.create({
    actor: user._id,
    room: room._id,
    action: "started_session",
    entityType: "session",
    entityId: session._id,
    metadata: { durationSeconds }
  });

  return session.populate("user", "name email avatar");
};

export const pauseSession = async (sessionId, user) => {
  const session = await StudySession.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);
  await ensureRoomMember(session.room, user._id);
  session.status = "paused";
  session.pausedAt = new Date();
  await session.save();
  return session;
};

export const resumeSession = async (sessionId, user) => {
  const session = await StudySession.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);
  await ensureRoomMember(session.room, user._id);
  session.status = "running";
  session.pausedAt = null;
  await session.save();
  return session;
};

export const endSession = async (sessionId, user, remainingSeconds = 0) => {
  const session = await StudySession.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);
  await ensureRoomMember(session.room, user._id);

  session.status = "ended";
  session.endedAt = new Date();
  session.remainingSeconds = Math.max(0, Number(remainingSeconds));
  await session.save();

  await StudyRoom.findByIdAndUpdate(session.room, { activeSession: null });
  await ActivityLog.create({
    actor: user._id,
    room: session.room,
    action: "ended_session",
    entityType: "session",
    entityId: session._id
  });

  return session;
};

export const getSessionHistory = async (userId) =>
  StudySession.find({ participants: userId }).populate("room", "name subject").sort({ createdAt: -1 }).limit(50);

