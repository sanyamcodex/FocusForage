import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Authentication token required", 401);
  }

  const decoded = verifyToken(header.split(" ")[1]);
  const user = await User.findById(decoded.sub).select("+passwordHash");

  if (!user) throw new AppError("User no longer exists", 401);
  req.user = user;
  next();
});

