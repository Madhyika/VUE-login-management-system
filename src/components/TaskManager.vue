<template>
  <div class="h-full bg-gray-200 flex">
    <!-- Sidebar -->
    <div class="w-50 min-h-screen bg-indigo-900 shadow-lg p-6 space-y-6">
      <div class="flex flex-col items-start space-y-10">
        <h1 class="text-2xl font-bold text-neutral-200">Task Manager</h1>
        <button
          @click="goToTasks"
          class="text-lg font-semibold text-gray-200 hover:underline"
        >
          Tasks
        </button>
        <button
          @click="goToNotes"
          class="text-lg font-semibold text-gray-200 hover:underline"
        >
          Notes
        </button>
      </div>
    </div>

    <!-- Top Bar -->
    <div
      class="absolute top-6 right-6 z-10 bg-indigo-900 px-6 py-3 rounded-lg shadow flex gap-6 items-center"
    >
      <button @click="changeProfile" class="text-gray-200 hover:underline">
        Change Profile
      </button>
      <button @click="openProfile" class="text-gray-200 hover:underline">
        Profile
      </button>
      <button
        @click="logout"
        class="bg-gray-200 text-indigo-900 px-4 py-2 rounded-lg hover:bg-white"
      >
        Log Out
      </button>
    </div>

    <!-- Search Bar -->
    <div class="w-full max-w-md mx-12 mt-5 absolute top-1 left-40 z-10">
      <div
        class="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm"
      >
        <input
          v-model="searchQuery"
          @input="performSearch"
          type="text"
          placeholder="Search tasks..."
          class="flex-1 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
        />
        <button
          @click="performSearch"
          class="ml-2 text-indigo-800 hover:text-indigo-900 font-semibold"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Tasks Form and List -->
    <div class="mt-16 max-w-2xl mx-auto">
      <div class="space-y-6 mt-10 w-full max-w-lg">
        <h1
          class="text-2xl text-center font-bold text-indigo-900 whitespace-nowrap"
        >
          Tasks
        </h1>
        <div class="bg-white p-10 rounded-lg shadow-md">
          <!-- Pagination Controls -->
          <div class="flex justify-between mt-0 py-6">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="text-indigo-900 hover:underline"
            >
              Previous
            </button>
            <span> {{ currentPage }}</span>
            <button
              @click="nextPage"
              :disabled="currentPage === taskStore.meta.last_page"
              class="text-indigo-900 hover:underline"
            >
              Next
            </button>
          </div>

          <form @submit.prevent="submitTask" class="space-y-4">
            <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
              <input
                v-model="newTask.title"
                placeholder="Task Title"
                class="bg-white text-black"
                required
              />
            </div>
            <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
              <input
                v-model="newTask.content"
                placeholder="Task Description"
                class="bg-white p-5 text-black"
                required
              />
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {{
                loading ? "Saving..." : isEditing ? "Update Task" : "Add Task"
              }}
            </button>

            <button
              v-if="isEditing"
              type="button"
              @click="cancelEdit"
              class="w-full bg-indigo-900 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              Cancel Edit
            </button>
          </form>

          <!-- Tasks List -->
          <ul class="mt-4 space-y-2">
            <li
              v-for="(task, index) in tasks"
              :key="index"
              class="p-4 border-2 border-gray-300 bg-gray-200 rounded-lg"
            >
              <div class="flex justify-between items-center">
                <span :class="{ 'line-through text-white': task.done }">
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
              </div>

              <ul
                v-if="task.children?.length"
                class="ml-4 mt-2 space-y-1 text-sm"
              >
                <li
                  v-for="sub in task.children"
                  :key="sub.id"
                  class="flex justify-between items-center"
                >
                  <span :class="{ 'line-through text-gray-500': sub.done }"
                    >- {{ sub.title }}</span
                  >
                  <button
                    @click="deleteTask(sub.id)"
                    class="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              </ul>

              <form
                v-if="!task.parent_task_id"
                @submit.prevent="addSubtask(task.id)"
                class="flex gap-2 mt-2 ml-4"
              >
                <input
                  v-model="subtaskInputs[task.id]"
                  type="text"
                  placeholder="Add subtask"
                  class="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  type="submit"
                  class="bg-indigo-900 text-white px-3 py-1 text-sm rounded hover:bg-indigo-700"
                >
                  Add
                </button>
              </form>
            </li>
          </ul>
        </div>
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
const subtaskInputs = ref({});

const tasks = computed(() => taskStore.tasks);
const loggedInUser = computed(() => authStore.loggedInUser);
const currentPage = ref(1);
const searchQuery = ref("");

onMounted(async () => {
  if (!loggedInUser.value) {
    router.push("/login");
    return;
  }
  await fetchTasks();
});
const fetchTasks = async () => {
  await taskStore.fetchTasksWithFilters(searchQuery.value, currentPage.value);
};

const performSearch = async () => {
  currentPage.value = 1;
  await fetchTasks();
  console.log("Searching for:", searchQuery.value);
};

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
const addSubtask = async (parent_id) => {
  const title = subtaskInputs.value[parent_id];

  if (!title) return;
  const parentTask = tasks.value.find((t) => t.id === parent_id);
  if (parentTask?.parent_id) {
    console.warn("Subtasks cannot have subtasks");
    return;
  }
  try {
    await taskStore.createTask(title, "", parent_id); // parent_id is used for subtask
    subtaskInputs.value[parent_id] = "";
    await taskStore.fetchTasks();
  } catch (error) {
    console.error("Error adding subtask:", error);
  }
};

const nextPage = async () => {
  if (currentPage.value < taskStore.meta.last_page) {
    currentPage.value++;
    await taskStore.fetchTasksWithFilters(searchQuery.value, currentPage.value);
  }
};

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await taskStore.fetchTasksWithFilters(searchQuery.value, currentPage.value);
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
