import { defineStore } from "pinia";
import api from "../api/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    users: JSON.parse(localStorage.getItem("users")) || [],
    loggedInUser: JSON.parse(localStorage.getItem("loggedInUser")) || null,
    error: null,
  }),
  actions: {
    async login(userInput, password) {
      try {
        const response = await api.post("/auth/login", { username, password });
        this.token = response.data.token;
        localStorage.setItem("token", this.token); // Store token in localStorage
      } catch (error) {
        console.error("Login failed:", error.response.data);
      }
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) => u.username === userInput || u.email === userInput
      );

      if (user) {
        if (user.password === password) {
          this.loggedInUser = user;
          localStorage.setItem("loggedInUser", JSON.stringify(user));
          this.error = null;
          return true;
        } else {
          this.error = "Invalid password.";
        }
      } else {
        this.error = "No user found with the given username or email.";
      }

      return false;
    },

    register(username, email, password) {
      const userExists = this.users.some(
        (user) => user.username === username || user.email === email
      );

      if (userExists) {
        this.error = "Username or email already exists.";
        return false;
      } else {
        const newUser = { username, email, password };
        this.users.push(newUser);
        localStorage.setItem("users", JSON.stringify(this.users));
        this.error = null;
        return true;
      }
    },

    logout() {
      this.loggedInUser = null;
      localStorage.removeItem("loggedInUser");
    },

    updatePassword(newPassword) {
      if (this.loggedInUser) {
        const userIndex = this.users.findIndex(
          (user) => user.username === this.loggedInUser.username
        );

        if (userIndex !== -1) {
          this.users[userIndex].password = newPassword;
          localStorage.setItem("users", JSON.stringify(this.users));

          this.loggedInUser.password = newPassword;
          localStorage.setItem(
            "loggedInUser",
            JSON.stringify(this.loggedInUser)
          );
        }
      }
    },

    updateProfile(newUsername, newPassword) {
      if (!this.loggedInUser) return false;

      const existingUser = this.users.find(
        (u) =>
          u.username === newUsername &&
          u.username !== this.loggedInUser.username
      );

      if (existingUser) {
        this.error = "Username already exists.";
        return false;
      }

      // Update the profile
      const userIndex = this.users.findIndex(
        (user) => user.username === this.loggedInUser.username
      );

      if (userIndex !== -1) {
        this.users[userIndex].username = newUsername;
        this.users[userIndex].password = newPassword;
        localStorage.setItem("users", JSON.stringify(this.users));

        this.loggedInUser = this.users[userIndex];
        localStorage.setItem("loggedInUser", JSON.stringify(this.loggedInUser));

        this.error = null;
        return true;
      }
      return false;
    },
  },
});
