import { asyncHandler } from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  ["name", "bio", "timezone", "studyGoalHours", "avatar"].forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

