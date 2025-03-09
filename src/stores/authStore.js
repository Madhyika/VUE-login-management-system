import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import api from "../api/api";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || null);
  const loggedInUser = ref(
    JSON.parse(localStorage.getItem("loggedInUser")) || null
  );
  const error = ref(null);

  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  });

  watch(loggedInUser, (newUser) => {
    if (newUser) {
      localStorage.setItem("loggedInUser", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("loggedInUser");
    }
  });

  // Actions
  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });

      if (response.data.token) {
        token.value = response.data.token;
        loggedInUser.value = response.data.user;
        error.value = null;
        return true;
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Login failed.";
      console.error("Login failed:", err);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || "Registration failed.");
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to register.";
      return false;
    }
  };

  const logout = () => {
    token.value = null;
    loggedInUser.value = null;
  };

  const updatePassword = async (newPassword) => {
    if (!token.value) {
      error.value = "User not authenticated.";
      return false;
    }
    try {
      const response = await api.put(
        "/auth/update-password",
        { newPassword },
        {
          headers: { Authorization: `Bearer ${token.value}` },
        }
      );

      if (response.data.message) {
        return true;
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update password.";
      return false;
    }
  };

  return {
    token,
    loggedInUser,
    error,
    isAuthenticated: computed(() => !!token.value),
    login,
    register,
    logout,
    updatePassword,
  };
});
