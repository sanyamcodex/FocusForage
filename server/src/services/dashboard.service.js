import { ActivityLog } from "../models/ActivityLog.js";
import { StudyRoom } from "../models/StudyRoom.js";
import { StudySession } from "../models/StudySession.js";

export const getDashboardSummary = async (user) => {
  const rooms = await StudyRoom.find({
    members: { $elemMatch: { user: user._id, status: "active" } }
  }).sort({ updatedAt: -1 });

  const sessions = await StudySession.find({ participants: user._id, status: "ended" }).sort({ createdAt: -1 });
  const totalSeconds = sessions.reduce(
    (sum, session) => sum + Math.max(0, session.durationSeconds - session.remainingSeconds),
    0
  );

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const weeklyStats = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return { label: day.toLocaleDateString("en", { weekday: "short" }), seconds: 0 };
  });

  sessions.forEach((session) => {
    if (session.createdAt >= weekStart) {
      const index = Math.floor((session.createdAt - weekStart) / 86400000);
      if (weeklyStats[index]) {
        weeklyStats[index].seconds += Math.max(0, session.durationSeconds - session.remainingSeconds);
      }
    }
  });

  const recentActivity = await ActivityLog.find({ actor: user._id })
    .populate("room", "name subject")
    .sort({ createdAt: -1 })
    .limit(8);

  return {
    totalStudyHours: Number((totalSeconds / 3600).toFixed(1)),
    weeklyStats,
    activeRooms: rooms.length,
    rooms: rooms.slice(0, 6),
    recentActivity,
    streak: user.streak
  };
};

