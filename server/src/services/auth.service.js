import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) throw new AppError("Name, email, and password are required", 400);
  if (password.length < 8) throw new AppError("Password must be at least 8 characters", 400);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("Email is already registered", 409);

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  return { user: user.toSafeJSON(), token: signToken(user._id) };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) throw new AppError("Email and password are required", 400);

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  return { user: user.toSafeJSON(), token: signToken(user._id) };
};

