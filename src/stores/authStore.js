import { defineStore } from "pinia";
import api from "../api/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    loggedInUser: null,
    error: null,
  }),
  actions: {
    async login(username, password) {
      try {
        const response = await api.post("/auth/login", { username, password });
    
        if (response.data.token) {
          this.token = response.data.token;
          this.loggedInUser = response.data.user; 
          this.error = null;
          return true;
        } else {
          throw new Error("Invalid API response");
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Login failed.";
        console.error("Login failed:", error);
        return false;
      }
    },
    
    async register(username, email, password) {
      try {
        const response = await api.post("/auth/register", { username, email, password });
    
        if (response.data.success) {
          return true;
        } else {
          throw new Error(response.data.message || "Registration failed.");
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to register.";
        return false;
      }
    },
    logout() {
      this.loggedInUser = null;
      this.token = null;
    },


    async updatePassword(newPassword) {
      if (!this.token) {
        this.error = "User not authenticated.";
        return false;
      }
      try {
        const response = await api.put("/auth/update-password", { newPassword });
    
        if (response.data.message) {
          return true;
        } else {
          throw new Error("Unexpected response from server.");
        }
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to update password.";
        return false;
      }
    }
    },
  },
);
