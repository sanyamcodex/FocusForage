import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";

export const userRoutes = Router();

userRoutes.use(protect);
userRoutes.get("/me", getProfile);
userRoutes.patch("/me", updateProfile);

