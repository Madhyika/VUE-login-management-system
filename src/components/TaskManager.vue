<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center p-6">
    <div
      class="w-full max-w-2xl bg-white p-4 rounded-lg shadow-lg flex justify-between items-center"
    >
      <div class="flex gap-24">
        <button @click="goToTasks" class="text-xl font-bold text-purple-600">
          Task Manager
        </button>
        <button @click="goToNotes" class="text-xl font-bold text-purple-600">
          Notes
        </button>
      </div>
      <div class="flex gap-4">
        <button @click="changeProfile" class="text-purple-600 hover:underline">
          Change Profile
        </button>
        <button @click="openProfile" class="text-purple-600 hover:underline">
          Profile
        </button>
        <button
          @click="logout"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Log Out
        </button>
      </div>
    </div>

    <div class="space-y-6 mt-10 w-full max-w-lg">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <form @submit.prevent="submitTask" class="space-y-4">
          <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
            <input
              v-model="newTask.title"
              placeholder="Task Title"
              class="w-full outline-none"
              required
            />
          </div>
          <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
            <input
              v-model="newTask.content"
              placeholder="Task Description"
              class="w-full outline-none"
              required
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {{ loading ? "Saving..." : isEditing ? "Update Task" : "Add Task" }}
          </button>

          <button
            v-if="isEditing"
            type="button"
            @click="cancelEdit"
            class="w-full bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel Edit
          </button>
        </form>

        <ul class="mt-4 space-y-2">
          <li
            v-for="(task, index) in tasks"
            :key="index"
            class="flex justify-between items-center p-3 border-b border-gray-200"
          >
            <span :class="{ 'line-through text-gray-500': task.done }">
              {{ task.title }} - {{ task.content }}
            </span>
            <div class="space-x-2">
              <button
                @click="editTask(task)"
                class="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                @click="updateTask(task)"
                class="text-green-600 hover:underline"
              >
                {{ task.done ? "Undo" : "Done" }}
              </button>
              <button
                @click="deleteTask(task.id || task._id)"
                class="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { computed, onMounted, ref } from "vue";
import { useTaskStore } from "../stores/taskStore";

const authStore = useAuthStore();
const router = useRouter();
const taskStore = useTaskStore();

const newTask = ref({ title: "", content: "" });
const editTaskId = ref(null);
const isEditing = ref(false);
const loading = ref(false);

const tasks = computed(() => taskStore.tasks);
const loggedInUser = computed(() => authStore.loggedInUser);

onMounted(async () => {
  if (!loggedInUser.value) {
    router.push("/login");
    return;
  }
  await taskStore.fetchTasks();
});

const submitTask = async () => {
  if (!newTask.value.title || !newTask.value.content) return;

  loading.value = true;
  try {
    if (isEditing.value && editTaskId.value) {
      await taskStore.updateTask(
        editTaskId.value,
        newTask.value.title,
        newTask.value.content,
        false
      );
    } else {
      await taskStore.createTask(newTask.value.title, newTask.value.content);
    }

    newTask.value = { title: "", content: "" };
    editTaskId.value = null;
    isEditing.value = false;
  } catch (error) {
    console.error("Error saving task:", error);
  } finally {
    loading.value = false;
  }
};

const editTask = (task) => {
  newTask.value.title = task.title;
  newTask.value.content = task.content;
  editTaskId.value = task.id || task._id;
  isEditing.value = true;
};

const cancelEdit = () => {
  newTask.value = { title: "", content: "" };
  editTaskId.value = null;
  isEditing.value = false;
};

const updateTask = async (task) => {
  const taskId = task.id || task._id;
  if (!taskId) {
    console.error("Missing task ID!", task);
    return;
  }
  try {
    await taskStore.updateTask(task.id, task.title, task.content, !task.done);
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

const deleteTask = async (id) => {
  try {
    await taskStore.deleteTask(id);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

const goToNotes = () => router.push("/notes");
const goToTasks = () => router.push("/tasks");
const logout = () => {
  authStore.logout();
  router.push("/login");
};
const openProfile = () => router.push("/profile");
const changeProfile = () => router.push("/profile/change");
</script>
