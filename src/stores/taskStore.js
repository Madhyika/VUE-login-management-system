import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/api.js";

export const useTaskStore = defineStore("task", () => {
  const tasks = ref([]);
  const error = ref(null);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/get");
      console.log("Fetched tasks:", response.data);
      tasks.value = response.data.data;
      error.value = null;
    } catch (err) {
      error.value = "Failed to fetch tasks";
    }
  };

  const createTask = async (title, content) => {
    try {
      await api.post("/tasks/create", { title, content });
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to create task";
    }
  };

  const updateTask = async (id, title, content, done) => {
    try {
      await api.put(`/tasks/update/${id}`, { title, content, done });
      const taskIndex = tasks.value.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = { ...tasks.value[taskIndex], title, content, done };
      }
    } catch (err) {
      error.value = "Failed to update task";
      console.error(err);
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
  const createChildTask = async (parentId, title, content) => {
    try {
      await api.get("/sanctum/csrf-cookie");

      const response = await api.post("/tasks", {
        title,
        content,
        completed: false,
        parent_id: parentId,
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
