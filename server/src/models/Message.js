import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "StudyRoom", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 1200 },
    type: { type: String, enum: ["message", "system"], default: "message" },
    metadata: { type: Object, default: {} },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);

