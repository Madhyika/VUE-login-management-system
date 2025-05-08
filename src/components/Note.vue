<template>
  <div class="h-full bg-slate-800 flex">
    <!-- Sidebar -->
    <div class="w-50 min-h-screen bg-zinc-900 shadow-lg p-6 space-y-6">
      <div class="flex flex-col items-start space-y-10">
        <h1 class="text-2xl font-bold text-neutral-200">Task Manager</h1>
        <button
          @click="goToTasks"
          class="text-lg font-semibold text-slate-400 hover:underline"
        >
          Tasks
        </button>
        <button
          @click="goToNotes"
          class="text-lg font-semibold text-slate-400 hover:underline"
        >
          Notes
        </button>
      </div>
    </div>

    <!-- Top Bar -->
    <div
      class="absolute top-6 right-6 z-10 bg-zinc-900 px-6 py-3 rounded-lg shadow flex gap-6 items-center"
    >
      <button @click="changeProfile" class="text-slate-400 hover:underline">
        Change Profile
      </button>
      <button @click="openProfile" class="text-slate-400 hover:underline">
        Profile
      </button>
      <button
        @click="logout"
        class="bg-zinc-800 text-slate-400 px-4 py-2 rounded-lg hover:bg-slate-700"
      >
        Log Out
      </button>
    </div>

    <!-- Search Bar -->
    <div class="w-full max-w-md mx-12 mt-5 absolute top-1 left-40 z-10">
      <div
        class="flex items-center bg-zinc-300 border border-gray-300 rounded-full px-4 py-2 shadow-sm"
      >
        <input
          v-model="searchQuery"
          type="text"
          @input="performSearch"
          placeholder="Search Notes..."
          class="flex-1 bg-transparent focus:outline-none text-black placeholder-gray-600"
        />
        <button
          @click="performSearch"
          class="ml-2 text-zinc-800 hover:text-zinc-600 font-semibold"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Note Form and List -->
    <div class="mt-16 max-w-2xl mx-auto">
      <div class="space-y-6 mt-10 w-full max-w-lg">
        <h1 class="text-2xl text-center font-bold text-white whitespace-nowrap">
          Notes
        </h1>
        <div class="bg-zinc-800 p-10 rounded-lg shadow-md">
          <!-- Pagination Controls -->
          <div class="flex justify-between mt-0 py-6">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="text-white hover:underline"
            >
              Previous
            </button>
            <span> {{ currentPage }}</span>
            <button
              @click="nextPage"
              :disabled="currentPage === noteStore.meta.last_page"
              class="text-white hover:underline"
            >
              Next
            </button>
          </div>

          <form @submit.prevent="submitNote" class="space-y-4">
            <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
              <input
                v-model="newNote.title"
                placeholder="Note Title"
                class="bg-zinc-800 text-white"
                required
              />
            </div>
            <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
              <input
                v-model="newNote.content"
                placeholder="Note Description"
                class="bg-zinc-800 p-10 text-white"
                required
              />
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-zinc-700 text-white py-2 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {{
                loading ? "Saving..." : isEditing ? "Update Note" : "Add Note"
              }}
            </button>

            <button
              v-if="isEditing"
              type="button"
              @click="cancelEdit"
              class="w-full bg-zinc-700 text-white py-2 rounded-lg hover:bg-slate-700"
            >
              Cancel Edit
            </button>
          </form>

          <!-- Notes List -->
          <ul class="mt-4 space-y-2">
            <li
              v-for="(note, index) in notes"
              :key="index"
              class="p-4 border-2 border-gray-300 bg-zinc-300 rounded-lg"
            >
              <span :class="{ 'line-through text-white': note?.done }">
                {{ note.title }} - {{ note.content }}
              </span>
              <div class="space-x-2">
                <button
                  @click="editNote(note)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="deleteNote(note.id || note._id)"
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
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useNoteStore } from "../stores/noteStore";

const router = useRouter();
const authStore = useAuthStore();
const noteStore = useNoteStore();

const newNote = ref({ title: "", content: "" });
const editNoteId = ref(null);
const isEditing = ref(false);
const loading = ref(false);

const notes = computed(() => noteStore.notes);
const loggedInUser = computed(() => authStore.loggedInUser);
const currentPage = ref(1);
const searchQuery = ref("");

onMounted(async () => {
  if (!loggedInUser.value) {
    router.push("/login");
    return;
  }
  await fetchNotes();
});

const fetchNotes = async () => {
  await noteStore.fetchNotesWithFilters(searchQuery.value, currentPage.value);
};

const performSearch = async () => {
  currentPage.value = 1;
  await fetchNotes();
  console.log("Searching for:", searchQuery.value);
};

const submitNote = async () => {
  if (!newNote.value.title || !newNote.value.content) return;

  loading.value = true;
  try {
    if (isEditing.value && editNoteId.value) {
      await noteStore.updateNote(
        editNoteId.value,
        newNote.value.title,
        newNote.value.content,
        false
      );
    } else {
      await noteStore.createNote(newNote.value.title, newNote.value.content);
    }

    newNote.value = { title: "", content: "" };
    editNoteId.value = null;
    isEditing.value = false;
  } catch (error) {
    console.error("Error submitting note:", error);
  } finally {
    loading.value = false;
  }
};

const editNote = (note) => {
  newNote.value.title = note.title;
  newNote.value.content = note.content;
  editNoteId.value = note.id || note._id;
  isEditing.value = true;
};

const cancelEdit = () => {
  newNote.value = { title: "", content: "" };
  editNoteId.value = null;
  isEditing.value = false;
};

const deleteNote = async (id) => {
  try {
    await noteStore.deleteNote(id);
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};

const nextPage = async () => {
  if (currentPage.value < noteStore.meta.last_page) {
    currentPage.value++;
    await noteStore.fetchNotesWithFilters(searchQuery.value, currentPage.value);
  }
};

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await noteStore.fetchNotesWithFilters(searchQuery.value, currentPage.value);
  }
};

const goToNotes = () => router.push("/notes");
const goToTasks = () => router.push("/tasks");
const openProfile = () => router.push("/profile");
const changeProfile = () => router.push("/profile/change");
const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>
