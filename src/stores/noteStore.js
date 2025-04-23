import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/api.js";

export const useNoteStore = defineStore("note", () => {
  const notes = ref([]);
  const error = ref(null);

  const fetchNotes = async () => {
    try {
      const response = await api.get("/notes/get");
      console.log("Fetched notes:", response.data);
      notes.value = response.data.data;
      error.value = null;
    } catch (err) {
      error.value = "Failed to fetch notes";
    }
  };

  const createNote = async (title, content) => {
    try {
      await api.post("/notes/create", { title, content });
      await fetchNotes();
    } catch (err) {
      error.value = "Failed to create note";
    }
  };

  const updateNote = async (id, title, content, done) => {
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
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/delete/${id}`);
      await fetchNotes();
    } catch (err) {
      error.value = "Failed to delete note";
    }
  };
  const createChildNote = async (parent_id, title, content) => {
    try {
      // await api.get("/sanctum/csrf-cookie");

      const response = await api.post("/notes", {
        title,
        content,
        completed: false,
        parent_id,
      });

      return response.data.data;
    } catch (err) {
      console.error("Failed to create child note:", err);
      return null;
    }
  };

  return {
    notes,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    createChildNote,
  };
});
