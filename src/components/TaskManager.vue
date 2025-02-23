<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center p-6">
    <div
      class="w-full max-w-2xl bg-white p-4 rounded-lg shadow-lg flex justify-between items-center"
    >
      <h1 class="text-xl font-bold text-purple-600">Task Manager</h1>
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
              v-model="newTask.description"
              placeholder="Task Description"
              class="w-full outline-none"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Add Task
          </button>
        </form>
        <ul class="mt-4 space-y-2">
          <li
            v-for="(task, index) in tasks"
            :key="index"
            class="flex justify-between items-center p-3 border-b border-gray-200"
          >
            <span :class="{ 'line-through text-gray-500': task.done }"
              >{{ task.title }} - {{ task.description }}</span
            >
            <div class="space-x-2">
              <button
                @click="toggleDone(index)"
                class="text-green-600 hover:underline"
              >
                {{ task.done ? "Undo" : "Done" }}
              </button>
              <button
                @click="deleteTask(index)"
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

<script>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authstore";
import { computed, onMounted, ref } from "vue";

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const newUsername = ref("");
    const newPassword = ref("");
    const tasks = ref([]);
    const newTask = ref({ title: "", description: "" });
    const openProfile = () => {
      router.push("/profile"); // Opens profile page
    };
    const loggedInUser = computed(() => authStore.loggedInUser);

    onMounted(() => {
      if (!loggedInUser.value) {
        router.push("/login");
        return;
      }
      tasks.value =
        JSON.parse(localStorage.getItem(loggedInUser.value.username)) || [];
    });

    const submitTask = () => {
      tasks.value.push({ ...newTask.value, done: false });
      saveTasks();
      newTask.value = { title: "", description: "" };
    };

    const toggleDone = (index) => {
      tasks.value[index].done = !tasks.value[index].done;
      saveTasks();
    };

    const deleteTask = (index) => {
      tasks.value.splice(index, 1);
      saveTasks();
    };

    const saveTasks = () => {
      if (loggedInUser.value) {
        localStorage.setItem(
          loggedInUser.value.username,
          JSON.stringify(tasks.value)
        );
      }
    };

    const logout = () => {
      authStore.logout();
      router.push("/login");
    };

    const changeProfile = () => {
      if (authStore.updateProfile(newUsername.value, newPassword.value)) {
        alert("Profile updated successfully!");
        authStore.logout();
        router.push("/login");
      } else {
        alert(authStore.error);
      }
    };

    return {
      loggedInUser,
      newUsername,
      newPassword,
      tasks,
      newTask,
      submitTask,
      toggleDone,
      deleteTask,
      logout,
      changeProfile,
      openProfile,
    };
  },
};
</script>
