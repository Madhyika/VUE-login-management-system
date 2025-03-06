<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-semibold text-gray-800 text-center mb-6">
        Login Page
      </h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="userInput" class="block text-sm text-gray-700 mb-1"
            >Username/Email:</label
          >
          <input
            v-model="userInput"
            type="text"
            id="userInput"
            placeholder="Enter username or email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm text-gray-700 mb-1"
            >Password:</label
          >
          <input
            v-model="password"
            type="password"
            id="password"
            placeholder="Password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div class="mb-4">
          <span class="mt-4 text-sm text-gray-600 text-center">
            Don't have an account?
            <router-link to="/register" class="text-purple-600 hover:underline"
              >Register</router-link
            >
          </span>
          <router-link to="/register"></router-link>
        </div>
        <button
          type="submit"
          class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Login
        </button>
        <p v-if="error" class="mt-2 text-sm text-red-500 text-center">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authstore";
import { ref } from "vue";
import axios from "axios";

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const userInput = ref("");
    const password = ref("");
    const error = ref(null);
    const loading = ref(false);

    const login = async () => {
      error.value = null;
      loading.value = true;

      try {
        const response = await axios.post(
          "http://localhost:8000/api/auth/login",
          { email: userInput.value, password: password.value },
          { withCredentials: true }
        );
        console.log("Login Success:", response.data);

        authStore.setUser(response.data.user);
        authStore.setToken(response.data.token);

        router.push("/tasks");
      } catch (error) {
        console.error("Login Failed:", err.response ? err.response.data : error);
        error.value = error.response?.data?.message || "Login failed. Please try again.";
      } finally {
        loading.value = false;
      }
    };

    return { userInput, password, error, login };
  },
};
</script>
