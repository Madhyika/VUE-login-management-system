import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/api.js";

export const useNoteStore = defineStore("note", () => {
  const notes = ref([]);
  const meta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  });
  const error = ref(null);
  const loading = ref(false);

  // Fetch Notes without filters
  const fetchNotes = async () => {
    loading.value = true;
    try {
      const response = await api.get("/notes/get");
      console.log("Fetched notes:", response.data);
      notes.value = response.data.data.data;
      meta.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
      };
      error.value = null;
    } catch (err) {
      error.value = "Failed to fetch notes";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch Notes with filters (search and pagination)
  const fetchNotesWithFilters = async (
    name_ref = "",
    page = 1,
    perPage = 5
  ) => {
    loading.value = true;
    const filters = JSON.stringify({ name: name_ref });

    try {
      const response = await api.get("/notes/get", {
        params: {
          filters,
          page,
          per_page: perPage,
        },
      });
      notes.value = response.data.data.data;
      meta.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
      };
    } catch (err) {
      error.value = "Failed to fetch filtered notes";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Create a new note
  const createNote = async (title, content) => {
    loading.value = true;
    try {
      await api.post("/notes/create", { title, content });
      await fetchNotes();
    } catch (err) {
      error.value = "Failed to create note";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Update an existing note
  const updateNote = async (id, title, content, done) => {
    loading.value = true;
    try {
      await api.put(`/notes/update/${id}`, { title, content, done });
      const noteIndex = notes.value.findIndex((note) => note.id === id);
      if (noteIndex !== -1) {
        notes.value[noteIndex] = {
          ...notes.value[noteIndex],
          title,
          content,
          done,
        };
      }
    } catch (err) {
      error.value = "Failed to update note";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    loading.value = true;
    try {
      await api.delete(`/notes/delete/${id}`);
      await fetchNotes();
    } catch (err) {
      error.value = "Failed to delete note";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  return {
    notes,
    error,
    meta,
    loading,
    fetchNotes,
    fetchNotesWithFilters,
    createNote, 
    updateNote,
    deleteNote,
  };
});
