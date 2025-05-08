<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-semibold text-gray-800 text-center mb-6">
        Login Page
      </h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="login" class="block text-sm text-gray-700 mb-1">
            Username/Email:
          </label>
          <input
            v-model="login"
            type="text"
            id="login"
            placeholder="Enter username or email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm text-gray-700 mb-1">
            Password:
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              placeholder="Password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="mb-4">
          <span class="mt-4 text-sm text-gray-600 text-center">
            Don't have an account?
            <router-link to="/register" class="text-indigo-900 font-semibold hover:underline">
              Register
            </router-link>
          </span>
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          :disabled="loading"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>
        <p v-if="error" class="mt-2 text-sm text-red-500 text-center">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { ref } from "vue";

const authStore = useAuthStore();
const router = useRouter();
const login = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref(null);
const loading = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  error.value = null;
  loading.value = true;

  const success = await authStore.login(login.value, password.value);
  if (success) {
    router.push("/tasks");
  } else {
    error.value = authStore.error;
  }
  loading.value = false;
};
</script>
