import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const baseURL = rawBaseURL.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every API request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auto-handle 401 session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/auth" &&
        window.location.pathname !== "/"
      ) {
        localStorage.removeItem("access_token");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;