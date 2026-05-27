import crypto from "crypto";
import { ActivityLog } from "../models/ActivityLog.js";
import { Message } from "../models/Message.js";
import { StudyRoom } from "../models/StudyRoom.js";
import { AppError } from "../utils/AppError.js";

const inviteCode = () => crypto.randomBytes(5).toString("hex");

export const ensureRoomMember = async (roomId, userId) => {
  const room = await StudyRoom.findOne({
    _id: roomId,
    members: { $elemMatch: { user: userId, status: "active" } }
  });
  if (!room) throw new AppError("Room not found or access denied", 404);
  return room;
};

export const createRoom = async (user, payload) => {
  if (!payload.name) throw new AppError("Room name is required", 400);
  const room = await StudyRoom.create({
    name: payload.name,
    description: payload.description || "",
    subject: payload.subject || "General",
    inviteCode: inviteCode(),
    owner: user._id,
    members: [{ user: user._id, role: "owner" }]
  });

  await ActivityLog.create({
    actor: user._id,
    room: room._id,
    action: "created_room",
    entityType: "room",
    entityId: room._id
  });

  return room.populate("members.user", "name email avatar");
};

export const listRooms = async (userId) =>
  StudyRoom.find({ members: { $elemMatch: { user: userId, status: "active" } } })
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .sort({ updatedAt: -1 });

export const getRoom = async (roomId, userId) => {
  await ensureRoomMember(roomId, userId);
  return StudyRoom.findById(roomId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .populate("activeSession");
};

export const updateRoom = async (roomId, userId, payload) => {
  const room = await ensureRoomMember(roomId, userId);
  const member = room.members.find((item) => item.user.toString() === userId.toString());
  if (member?.role !== "owner") throw new AppError("Only the owner can update this room", 403);

  ["name", "description", "subject", "visibility"].forEach((field) => {
    if (payload[field] !== undefined) room[field] = payload[field];
  });
  await room.save();
  return getRoom(roomId, userId);
};

export const joinByInvite = async (inviteCodeValue, user) => {
  const room = await StudyRoom.findOne({ inviteCode: inviteCodeValue });
  if (!room) throw new AppError("Invalid invite link", 404);

  const member = room.members.find((item) => item.user.toString() === user._id.toString());
  if (member) member.status = "active";
  else room.members.push({ user: user._id, role: "member" });

  await room.save();
  await ActivityLog.create({
    actor: user._id,
    room: room._id,
    action: "joined_room",
    entityType: "room",
    entityId: room._id
  });

  return getRoom(room._id, user._id);
};

export const leaveRoom = async (roomId, user) => {
  const room = await ensureRoomMember(roomId, user._id);
  if (room.owner.toString() === user._id.toString()) {
    throw new AppError("Transfer ownership before leaving your own room", 400);
  }

  const member = room.members.find((item) => item.user.toString() === user._id.toString());
  member.status = "left";
  await room.save();
  return { message: "Left room successfully" };
};

export const listMessages = async (roomId, userId) => {
  await ensureRoomMember(roomId, userId);
  return Message.find({ room: roomId }).populate("sender", "name email avatar").sort({ createdAt: 1 }).limit(100);
};

export const createMessage = async (roomId, user, body, type = "message") => {
  await ensureRoomMember(roomId, user._id);
  const message = await Message.create({ room: roomId, sender: user._id, body, type, readBy: [user._id] });
  return message.populate("sender", "name email avatar");
};

