import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/api.js";

export const useTaskStore = defineStore("task", () => {
  const tasks = ref([]);
  const error = ref(null);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/api/tasks/get");
      tasks.value = response.data;
      error.value = null;
    } catch (err) {
      error.value = "Failed to fetch tasks";
    }
  };

  const createTask = async (title, description) => {
    try {
      await api.post("/api/tasks/create", { title, description });
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to create task";
    }
  };

  const updateTask = async (id, title, description, done) => {
    try {
      await api.put(`/api/tasks/update/${id}`, { title, description, done });
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to update task";
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/delete/${id}`);
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to delete task";
    }
  };
  const createChildTask = async (parentId, title, description) => {
    try {
      await axios.get("/sanctum/csrf-cookie"); // if not already done globally
  
      const response = await api.post("/api/tasks", {
        title,
        description,
        completed: false,
        parent_id: parentId, // 👈 attach to parent
      });
  
      return response.data.data;
    } catch (err) {
      console.error("Failed to create child task:", err);
      return null;
    }
  };
  

  return {
    tasks,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    createChildTask,
  };
});
