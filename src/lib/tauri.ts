import { invoke } from "@tauri-apps/api/core";

const invokeTauri = async <T>(cmd: string, args?: Record<string, unknown>) => {
  if (
    typeof window !== "undefined" &&
    ((window as any).__TAURI__ !== undefined || (window as any).__TAURI_INTERNALS__ !== undefined)
  ) {
    return invoke<T>(cmd, args);
  }

  throw new Error(
    "Tauri runtime not available. Run the app via `npm run tauri dev` or build the Tauri app.",
  );
};

export type Note = {
  id: number;
  title: string; 
  content: string;
  created_at: string;
  updated_at: string;
};
export const getAllNotes = async (): Promise<Note[]> => {
  return invokeTauri<Note[]>("get_all_notes");
};

export const getNoteById = async (id: number): Promise<Note | null> => {
  return invokeTauri<Note | null>("get_note_by_id", { id });
};

export const createNote = async (title: string, content?: string): Promise<Note> => {
  return invokeTauri<Note>("create_note", { title, content });
};

export const updateNote = async (
  id: number, 
  title?: string, 
  content?: string
): Promise<Note> => {
  return invokeTauri<Note>("update_note", { id, title, content });
};

export const deleteNote = async (id: number): Promise<void> => {
  return invokeTauri<void>("delete_note", { id });
};
