import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "StudyRoom", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mode: { type: String, enum: ["pomodoro", "deep-work"], default: "pomodoro" },
    status: { type: String, enum: ["running", "paused", "ended"], default: "running" },
    startedAt: { type: Date, default: Date.now },
    pausedAt: Date,
    endedAt: Date,
    durationSeconds: { type: Number, default: 1500 },
    remainingSeconds: { type: Number, default: 1500 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

studySessionSchema.index({ user: 1, createdAt: -1 });

export const StudySession = mongoose.model("StudySession", studySessionSchema);

