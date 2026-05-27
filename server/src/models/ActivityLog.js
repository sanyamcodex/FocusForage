import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "StudyRoom", index: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ["room", "message", "session", "user"], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

