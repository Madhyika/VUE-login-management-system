import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
