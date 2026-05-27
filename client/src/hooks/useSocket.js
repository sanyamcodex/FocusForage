import { useEffect, useMemo } from "react";
import { createSocket } from "../lib/socket";

export function useSocket() {
  const token = localStorage.getItem("focusforge_token");
  const socket = useMemo(() => (token ? createSocket(token) : null), [token]);

  useEffect(() => {
    if (!socket) return undefined;
    socket.connect();
    return () => socket.disconnect();
  }, [socket]);

  return socket;
}

