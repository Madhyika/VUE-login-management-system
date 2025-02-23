<template>
    <div class="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div class="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold text-center mb-4">Update Password</h2>
  
        <form @submit.prevent="updatePassword">
          <div class="mb-4">
            <label class="block text-sm text-gray-700">New Password:</label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full p-2 border rounded-lg"
              required
            />
          </div>
  
          <div class="mb-4">
            <label class="block text-sm text-gray-700">Confirm New Password:</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="w-full p-2 border rounded-lg"
              required
            />
          </div>
  
          <p v-if="errorMessage" class="text-red-500 text-sm mb-4">{{ errorMessage }}</p>
          <p v-if="successMessage" class="text-green-500 text-sm mb-4">{{ successMessage }}</p>
  
          <button
            type="submit"
            class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
          >
            Update Password
          </button>
        </form>
  
        <button @click="goBack" class="mt-4 text-purple-600 hover:underline">Back to Task Manager</button>
      </div>
    </div>
  </template>
  
  <script>
  import { useRouter } from "vue-router";
  import { useAuthStore } from "../stores/authstore";
  import { ref, onMounted } from "vue";
  
  export default {
    setup() {
      const authStore = useAuthStore();
      const router = useRouter();
      const newPassword = ref("");
      const confirmPassword = ref("");
      const errorMessage = ref("");
      const successMessage = ref("");
  
      onMounted(() => {
        if (!authStore.loggedInUser) {
          router.push("/TaskManager");
        }
      });
  
      const updatePassword = () => {
        errorMessage.value = "";
        successMessage.value = "";
  
        if (newPassword.value.length < 6) {
          errorMessage.value = "Password must be at least 6 characters long.";
          return;
        }
  
        if (newPassword.value !== confirmPassword.value) {
          errorMessage.value = "Passwords do not match!";
          return;
        }
  
        authStore.updatePassword(newPassword.value);
        successMessage.value = "Password updated successfully!";
    
      };
  
      const goBack = () => {
        router.push("/tasks");
      };
  
      return { newPassword, confirmPassword, updatePassword, goBack, errorMessage, successMessage };
    },
  };
  </script>
  