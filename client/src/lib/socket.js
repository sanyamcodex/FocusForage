import { io } from "socket.io-client";
import { socketBaseUrl } from "./utils";

export const createSocket = (token) =>
  io(socketBaseUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: false
  });

