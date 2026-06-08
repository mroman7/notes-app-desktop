import { create } from "zustand";
import { Note, getAllNotes, createNote, updateNote, deleteNote } from "../lib/tauri";

interface NoteState {
  notes: Note[];
  selectedNoteId: number | null;
  isLoading: boolean;
  
  // Actions
  fetchNotes: () => Promise<void>;
  setSelectedNoteId: (id: number | null) => void;
  addNote: (title: string, content?: string) => Promise<void>;
  editNote: (id: number, title?: string, content?: string) => Promise<void>;
  removeNote: (id: number) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,

  fetchNotes: async () => {
    set({ isLoading: true });
    const notes = await getAllNotes();
    set({ notes, isLoading: false });
  },

  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  addNote: async (title, content) => {
    const newNote = await createNote(title, content);
    set((state) => ({ notes: [newNote, ...state.notes] }));
  },

  editNote: async (id, title, content) => {
    const updatedNote = await updateNote(id, title, content);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
    }));
  },

  removeNote: async (id) => {
    await deleteNote(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    }));
  },
}));