<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-semibold text-gray-800 text-center mb-6">
        Register
      </h2>
      <form @submit.prevent="register">
        <div class="mb-4">
          <label for="username" class="block text-sm text-gray-700 mb-1"
            >Username:</label
          >
          <input
            v-model="username"
            type="text"
            id="username"
            placeholder="username"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm text-gray-700 mb-1"
            >Email:</label
          >
          <input
            v-model="email"
            type="email"
            id="email"
            placeholder="email"
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
            placeholder="create a password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div class="mb-4">
          <span class="mt-4 text-sm text-gray-600 text-center">
            Already have an account?
            <router-link to="/login" class="text-purple-600 hover:underline"
              >Login</router-link
            >
          </span>
          <router-link to="/login"></router-link>
        </div>
        <button
          type="submit"
          class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Register
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

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const username = ref("");
    const email = ref("");
    const password = ref("");
    const error = ref(null);
    const loading = ref(false);

    const register = async () => {
      error.value = null;
      loading.value = true;

      try {
        const success = await authStore.register(
          username.value,
          email.value,
          password.value
        );
        if (success) {
          router.push("/login");
        } else {
          error.value = authStore.error || "Registration failed.";
        }
      } catch (err) {
        error.value = "An unexpected error occurred.";
      } finally {
        loading.value = false;
      }
    };

    return { username, email, password, error, register, loading };
  },
};
</script>
