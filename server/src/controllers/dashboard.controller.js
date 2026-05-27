import { getDashboardSummary } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardSummary = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getDashboardSummary(req.user) });
});

