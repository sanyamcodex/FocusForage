import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProduction } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { authRoutes } from "./routes/auth.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { roomRoutes } from "./routes/room.routes.js";
import { sessionRoutes } from "./routes/session.routes.js";
import { userRoutes } from "./routes/user.routes.js";

export const app = express();

// Normalize origins — strip trailing slashes so CLIENT_URL works with or without /
const allowedOrigins = env.clientUrl.split(",").map((o) => o.trim().replace(/\/+$/, ""));

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

app.set("trust proxy", 1);

// ═══════════════════════════════════════════════════════
// CORS MUST be FIRST — before helmet, before everything
// ═══════════════════════════════════════════════════════
app.options("*", cors(corsOptions));   // preflight
app.use(cors(corsOptions));            // all requests

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use(morgan(isProduction ? "combined" : "dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "focusforge-api", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);
