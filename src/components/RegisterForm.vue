<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-semibold text-gray-800 text-center mb-6">
        Register
      </h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="name" class="block text-sm text-gray-700 mb-1"
            >Username:</label
          >
          <input
            v-model.trim="name"
            type="text"
            id="name"
            placeholder="Enter your username"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div class="mb-4">
          <label for="email" class="block text-sm text-gray-700 mb-1"
            >Email:</label
          >
          <input
            v-model.trim="email"
            type="email"
            id="email"
            placeholder="Enter your email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              placeholder="Create a password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$"
              title="Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a special character."
              
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
        <div class="mb-4 text-center">
          <span class="text-sm text-gray-600">
            Already have an account?
            <router-link to="/login" class="text-indigo-900 font-semibold hover:underline"
              >Login</router-link
            >
          </span>
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :disabled="loading"
        >
          {{ loading ? "Registering..." : "Register" }}
        </button>

        <p v-if="errorMessage" class="mt-2 text-sm text-red-500 text-center">
          {{ errorMessage }}
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
const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const loading = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleRegister = async () => {
  errorMessage.value = "";
  loading.value = true;

  if (!name.value || !email.value || !password.value) {
    errorMessage.value = "All fields are required.";
    loading.value = false;
    return;
  }

  try {
    const success = await authStore.register(
      name.value,
      email.value,
      password.value
    );
    if (success) {
      router.push("/login");
    } else {
      errorMessage.value =
        authStore.error || "Registration failed. Please try again.";
    }
  } catch (error) {
    errorMessage.value = "An unexpected error occurred.";
  } finally {
    loading.value = false;
  }
};
</script>
