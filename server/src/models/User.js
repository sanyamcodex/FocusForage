import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 240 },
    timezone: { type: String, default: "Asia/Calcutta" },
    studyGoalHours: { type: Number, default: 20 },
    streak: {
      current: { type: Number, default: 0 },
      best: { type: Number, default: 0 },
      lastStudiedAt: Date
    }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    timezone: this.timezone,
    studyGoalHours: this.studyGoalHours,
    streak: this.streak,
    createdAt: this.createdAt
  };
};

export const User = mongoose.model("User", userSchema);

