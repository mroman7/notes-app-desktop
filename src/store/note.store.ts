import { create } from "zustand";
import { Note, getAllNotes, createNote, updateNote, deleteNote, searchNotesInDb } from "../lib/tauri";



interface NoteState {
  notes: Note[];
  filteredNotes: Note[];
  selectedNoteId: number | null;
  isLoading: boolean;



  // Actions
  fetchNotes: () => Promise<void>;
  setSelectedNoteId: (id: number | null) => void;  
  addNote: (title: string, content?: string) => Promise<Note>;
  editNote: (id: number, title?: string, content?: string) => Promise<void>;
  removeNote: (id: number) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
}



export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  filteredNotes: [],
  selectedNoteId: null,
  isLoading: false,

  fetchNotes: async () => {
    set({ isLoading: true });
    const notes = await getAllNotes();
    set({ notes, filteredNotes: notes, isLoading: false });
  },

  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  addNote: async (title, content) => {
    const newNote = await createNote(title, content);
    set((state) => ({ 
      notes: [newNote, ...state.notes],
      filteredNotes: [newNote, ...state.filteredNotes],
      selectedNoteId: newNote.id 
    }));
    return newNote;
  },

  editNote: async (id, title, content) => {
    const updatedNote = await updateNote(id, title, content);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
      filteredNotes: state.filteredNotes.map((n) => (n.id === id ? updatedNote : n)),
    }));
  },

  removeNote: async (id) => {
    await deleteNote(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      filteredNotes: state.filteredNotes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    }));
  },

  searchNotes: async (query: string) => {
    if (!query.trim()) {
      set({ filteredNotes: get().notes });
      return;
    }

    // Perform DB search
    const results = await searchNotesInDb(query); // Assumes you have this function
    set({ filteredNotes: results });
  }
}));