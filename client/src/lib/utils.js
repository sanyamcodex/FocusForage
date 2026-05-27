import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatHours = (hours) => `${Number(hours || 0).toFixed(1)}h`;

export const formatTimer = (seconds) => {
  const safe = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0");
  const secs = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

export const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
export const socketBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

