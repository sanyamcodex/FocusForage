import { asyncHandler } from "../utils/asyncHandler.js";
import { endSession, getSessionHistory, pauseSession, resumeSession, startSession } from "../services/session.service.js";

export const sessionStart = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: { session: await startSession(req.params.roomId, req.user, req.body) } });
});

export const sessionPause = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { session: await pauseSession(req.params.sessionId, req.user) } });
});

export const sessionResume = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { session: await resumeSession(req.params.sessionId, req.user) } });
});

export const sessionEnd = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { session: await endSession(req.params.sessionId, req.user, req.body.remainingSeconds) } });
});

export const sessionHistory = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { sessions: await getSessionHistory(req.user._id) } });
});

