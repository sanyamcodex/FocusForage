import axios from "axios";
import { apiBaseUrl } from "./utils";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("focusforge_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Extract the most useful error message available
    const serverData = error.response?.data;
    const message =
      serverData?.message ||
      error.message ||
      "Network error";
    return Promise.reject({ message, ...serverData });
  }
);

