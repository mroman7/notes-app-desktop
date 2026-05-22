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
  content: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: number;
  project_id: number;
  title: string;
  status: string;
  description: string;
  time_required: string;
  created_at: string;
  updated_at: string;
};

export const getAllNotes = async (): Promise<Note[]> => {
  return invokeTauri<Note[]>("get_all_notes");
};

export const getNoteById = async (id: number): Promise<Note | null> => {
  return invokeTauri<Note | null>("get_note_by_id", { id });
};

export const saveNote = async (id: number | null, content: string): Promise<Note> => {
  return invokeTauri<Note>("save_note", { id, content });
};

export const getAllProjects = async (): Promise<Project[]> => {
  return invokeTauri<Project[]>("get_all_projects");
};

export const getTasksForProject = async (projectId: number): Promise<Task[]> => {
  return invokeTauri<Task[]>("get_tasks_for_project", { projectId });
};

export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
  return invokeTauri<Task>("update_task_status", { id, status });
};

export const createProject = async (name: string): Promise<Project> => {
  return invokeTauri<Project>("create_project", { name });
};

export const createTask = async (
  projectId: number,
  title: string,
  description?: string,
  timeRequired?: string
): Promise<Task> => {
  return invokeTauri<Task>("create_task", {
    projectId,
    title,
    description: description || "",
    timeRequired: timeRequired || "",
  });
};

export const updateTask = async (
  id: number,
  title: string,
  description: string,
  timeRequired: string,
  status: string
): Promise<Task> => {
  return invokeTauri<Task>("update_task", {
    id,
    title,
    description,
    timeRequired,
    status
  });
};

export const deleteTask = async (id: number): Promise<void> => {
  return invokeTauri<void>("delete_task", { id });
};

export const deleteNote = async (id: number): Promise<void> => {
  return invokeTauri<void>("delete_note", { id });
};
