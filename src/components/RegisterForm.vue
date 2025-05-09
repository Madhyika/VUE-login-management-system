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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            placeholder="Create a password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div class="mb-4 text-center">
          <span class="text-sm text-gray-600">
            Already have an account?
            <router-link to="/login" class="text-purple-600 hover:underline"
              >Login</router-link
            >
          </span>
        </div>

        <button
          type="submit"
          class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
const errorMessage = ref("");
const loading = ref(false);

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
