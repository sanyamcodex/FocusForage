import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "member"], default: "member" },
    status: { type: String, enum: ["active", "left"], default: "active" },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const studyRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 90 },
    description: { type: String, default: "", maxlength: 280 },
    subject: { type: String, default: "General", trim: true },
    visibility: { type: String, enum: ["private", "invite"], default: "invite" },
    inviteCode: { type: String, required: true, unique: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
    activeSession: { type: mongoose.Schema.Types.ObjectId, ref: "StudySession", default: null }
  },
  { timestamps: true }
);

studyRoomSchema.index({ owner: 1, updatedAt: -1 });
studyRoomSchema.index({ "members.user": 1 });

export const StudyRoom = mongoose.model("StudyRoom", studyRoomSchema);

