import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { registerSocketHandlers } from "./sockets/index.js";

const server = http.createServer(app);
const allowedOrigins = env.clientUrl.split(",").map((origin) => origin.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

registerSocketHandlers(io);

const start = async () => {
  await connectDB();
  server.listen(env.port, () => {
    console.log(`FocusForge API running on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

