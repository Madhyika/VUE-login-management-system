import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/api.js";

export const useTaskStore = defineStore("task", () => {
  const tasks = ref([]);
  const meta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  });
  const error = ref(null);
  const loading = ref(false);

  // Fetch Tasks without filters
  const fetchTasks = async () => {
    loading.value = true;
    try {
      const response = await api.get("/tasks/get");
      console.log("Fetched tasks:", response.data);
      tasks.value = response.data.data.data;
      meta.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
      };
      error.value = null;
    } catch (err) {
      error.value = "Failed to fetch tasks";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch Tasks with filters (search and pagination)
  const fetchTasksWithFilters = async (
    name_ref = "",
    page = 1,
    perPage = 5
  ) => {
    loading.value = true;
    const filters = JSON.stringify({ name: name_ref });

    try {
      const response = await api.get("/tasks/get", {
        params: {
          filters,
          page,
          per_page: perPage,
        },
      });
      tasks.value = response.data.data.data;
      meta.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
      };
    } catch (err) {
      error.value = "Failed to fetch filtered tasks";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Create a new task
  const createTask = async (title, content) => {
    loading.value = true;
    try {
      await api.post("/tasks/create", { title, content });
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to create task";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Update an existing task
  const updateTask = async (id, title, content, done) => {
    loading.value = true;
    try {
      await api.put(`/tasks/update/${id}`, { title, content, done });
      const taskIndex = tasks.value.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = {
          ...tasks.value[taskIndex],
          title,
          content,
          done,
        };
      }
    } catch (err) {
      error.value = "Failed to update task";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    loading.value = true;
    try {
      await api.delete(`/tasks/delete/${id}`);
      await fetchTasks();
    } catch (err) {
      error.value = "Failed to delete task";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  return {
    tasks,
    error,
    meta,
    loading,
    fetchTasks,
    fetchTasksWithFilters,
    createTask, 
    updateTask,
    deleteTask,
  };
});
