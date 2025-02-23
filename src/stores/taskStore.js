import { defineStore } from "pinia";
import api from "../api/api.js";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
    error: null,
  }),
  actions: {
    async fetchTasks() {
      try {
        const response = await api.get("/tasks/get");
        this.tasks = response.data;
      } catch (error) {
        this.error = "Failed to fetch tasks";
      }
    },

    async createTask(title, description) {
      try {
        await api.post("/tasks/create", { title, description });
        this.fetchTasks(); 
      } catch (error) {
        this.error = "Failed to create task";
      }
    },

    async updateTask(id, title, description) {
      try {
        await api.put(`/tasks/${id}`, { title, description });
        this.fetchTasks();
      } catch (error) {
        this.error = "Failed to update task";
      }
    },

    async deleteTask(id) {
      try {
        await api.delete(`/tasks/${id}`);
        this.fetchTasks();
      } catch (error) {
        this.error = "Failed to delete task";
      }
    },
  },
});
