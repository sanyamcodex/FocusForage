import { Router } from "express";
import { sessionEnd, sessionHistory, sessionPause, sessionResume, sessionStart } from "../controllers/session.controller.js";
import { protect } from "../middleware/auth.js";

export const sessionRoutes = Router();

sessionRoutes.use(protect);
sessionRoutes.get("/history", sessionHistory);
sessionRoutes.post("/:roomId/start", sessionStart);
sessionRoutes.post("/:sessionId/pause", sessionPause);
sessionRoutes.post("/:sessionId/resume", sessionResume);
sessionRoutes.post("/:sessionId/end", sessionEnd);

