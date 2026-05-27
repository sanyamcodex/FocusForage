import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createMessage,
  createRoom,
  getRoom,
  joinByInvite,
  leaveRoom,
  listMessages,
  listRooms,
  updateRoom
} from "../services/room.service.js";

export const roomIndex = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { rooms: await listRooms(req.user._id) } });
});

export const roomCreate = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: { room: await createRoom(req.user, req.body) } });
});

export const roomShow = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { room: await getRoom(req.params.roomId, req.user._id) } });
});

export const roomUpdate = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { room: await updateRoom(req.params.roomId, req.user._id, req.body) } });
});

export const roomJoin = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { room: await joinByInvite(req.params.inviteCode, req.user) } });
});

export const roomLeave = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await leaveRoom(req.params.roomId, req.user) });
});

export const messagesIndex = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { messages: await listMessages(req.params.roomId, req.user._id) } });
});

export const messageCreate = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: { message: await createMessage(req.params.roomId, req.user, req.body.body) }
  });
});

