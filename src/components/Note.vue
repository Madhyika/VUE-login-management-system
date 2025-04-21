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
        <form @submit.prevent="submitNote" class="space-y-4">
          <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
            <input
              v-model="newNote.title"
              placeholder="Note Title"
              class="w-full outline-none"
              required
            />
          </div>
          <div class="border-2 border-gray-300 rounded-lg p-2 w-full">
            <input
              v-model="newNote.content"
              placeholder="Note Description"
              class="w-full outline-none"
              required
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {{ loading ? "Saving..." : isEditing ? "Update Note" : "Add Note" }}
          </button>

          <!-- Cancel Edit Button -->
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
            v-for="(note, index) in notes"
            :key="index"
            class="flex justify-between items-center p-3 border-b border-gray-200"
          >
            <span :class="{ 'line-through text-gray-500': note.done }">
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

onMounted(async () => {
  if (!loggedInUser.value) {
    router.push("/login");
    return;
  }
  await noteStore.fetchNotes();
});

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

    // Reset after submission
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

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const goToNotes = () => router.push("/notes");
const goToTasks = () => router.push("/tasks");
const openProfile = () => router.push("/profile");
const changeProfile = () => router.push("/profile/change");
</script>
