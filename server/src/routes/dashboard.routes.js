import { Router } from "express";
import { dashboardSummary } from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(protect);
dashboardRoutes.get("/summary", dashboardSummary);

