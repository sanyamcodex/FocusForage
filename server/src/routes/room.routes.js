import { Router } from "express";
import {
  messageCreate,
  messagesIndex,
  roomCreate,
  roomIndex,
  roomJoin,
  roomLeave,
  roomShow,
  roomUpdate
} from "../controllers/room.controller.js";
import { protect } from "../middleware/auth.js";

export const roomRoutes = Router();

roomRoutes.use(protect);
roomRoutes.get("/", roomIndex);
roomRoutes.post("/", roomCreate);
roomRoutes.post("/join/:inviteCode", roomJoin);
roomRoutes.get("/:roomId", roomShow);
roomRoutes.patch("/:roomId", roomUpdate);
roomRoutes.post("/:roomId/leave", roomLeave);
roomRoutes.get("/:roomId/messages", messagesIndex);
roomRoutes.post("/:roomId/messages", messageCreate);

