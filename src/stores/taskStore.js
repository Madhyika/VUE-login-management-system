import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/api.js";

export const useTaskStore = defineStore("task", () => {
  const tasks = ref([]);
  const error = ref(null);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/get");
      tasks.value = response.data;
      error.value = null;
    } catch (err) {
      error.value = "Failed to fetch tasks";
    }
  };

  const createTask = async (title, description) => {
    try {
      await api.post("/tasks/create", { title, description });
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to create task";
    }
  };

  const updateTask = async (id, title, description, done) => {
    try {
      await api.post(`/tasks/done/${id}`, { title, description, done });
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to update task";
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/delete/${id}`);
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to delete task";
    }
  };

  return {
    tasks,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
});
