"use client";

import { useEffect, useState } from "react";
import {
  getAllProjects,
  getTasksForProject,
  updateTaskStatus,
  createTask,
  createProject,
  updateTask,
  deleteTask,
  type Task,
  type Project,
} from "@/lib/tauri";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  KanbanBoard,
  KanbanCards,
  KanbanCard,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Timer,
  Plus,
  MoreVertical,
  MessageSquare,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Trash2,
  Edit3,
  FileText,
  Clock,
  Layers,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type KanbanItem = {
  id: string;
  name: string;
  column: string;
  rawTask: Task;
  date: string;
  logTime: string;
  commentCount: number;
};

const columns = [
  { id: "todo", name: "To-do" },
  { id: "progress", name: "In Progress" },
  { id: "review", name: "Review Ready" },
  { id: "completed", name: "Completed" },
];

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Aug 26";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Aug 26";
  }
};

const getLoggedTime = (timeRequired: string, id: number): string => {
  if (!timeRequired) return "Log: 1h 43min";

  // Parse numeric values from string (e.g. "3h" -> 180 mins)
  const hoursMatch = timeRequired.match(/(\d+)\s*h/i);
  const minsMatch = timeRequired.match(/(\d+)\s*min/i);
  let totalMins = 0;
  if (hoursMatch) totalMins += parseInt(hoursMatch[1]) * 60;
  if (minsMatch) totalMins += parseInt(minsMatch[1]);

  if (totalMins === 0) {
    const num = parseFloat(timeRequired);
    if (!isNaN(num)) totalMins = num * 60;
  }

  if (totalMins === 0) {
    return "Log: 1h 43min";
  }

  // Return a deterministic log percentage (e.g. 50% - 85% of time required)
  const logPercent = 50 + (id % 36);
  const logMins = Math.round(totalMins * (logPercent / 100));
  const h = Math.floor(logMins / 60);
  const m = logMins % 60;

  if (h > 0 && m > 0) return `Log: ${h}h ${m}min`;
  if (h > 0) return `Log: ${h}h`;
  return `Log: ${m}min`;
};

const getCommentCount = (id: number): number => {
  return (id * 7) % 4; // Mock comments count: 0, 1, 2, or 3
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(true);

  // Create Task dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskTimeRequired, setTaskTimeRequired] = useState("");
  const [taskStatus, setTaskStatus] = useState("todo");

  // Edit Task dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTimeRequired, setEditTimeRequired] = useState("");
  const [editStatus, setEditStatus] = useState("todo");

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId !== null) {
      void loadTasks(selectedProjectId);
    } else {
      setTasks([]);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await getAllProjects();
      setProjects(result);
      if (result.length > 0) {
        setSelectedProjectId((current) => current ?? result[0].id);
      } else {
        setSelectedProjectId(null);
      }
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (projectId: number) => {
    setLoading(true);
    try {
      const result = await getTasksForProject(projectId);
      // Map legacy "pending" status to "todo"
      const mapped = result.map((t) => ({
        ...t,
        status: t.status === "pending" ? "todo" : t.status,
      }));
      setTasks(mapped);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const project = await createProject(newProjectName.trim());
      setProjects((current) => [...current, project]);
      setSelectedProjectId(project.id);
      setNewProjectName("");
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const handleDataChange = (newData: KanbanItem[]) => {
    // Detect column drop changes
    const updates = newData.filter((item) => {
      const current = tasks.find((task) => task.id === Number(item.id));
      return current?.status !== item.column;
    });

    setTasks((current) =>
      current.map((task) => {
        const updated = newData.find((item) => item.id === task.id.toString());
        return updated ? { ...task, status: updated.column } : task;
      }),
    );

    void (async () => {
      try {
        await Promise.all(
          updates.map((item) => updateTaskStatus(Number(item.id), item.column)),
        );
      } catch (error) {
        console.error("Failed to update task status", error);
      }
    })();
  };

  const handleOpenCreateDialog = (status: string) => {
    setTaskStatus(status);
    setTaskTitle("");
    setTaskDescription("");
    setTaskTimeRequired("");
    setIsCreateOpen(true);
  };

  const handleCreateTaskSubmit = async () => {
    if (!selectedProjectId || !taskTitle.trim()) return;

    try {
      const task = await createTask(
        selectedProjectId,
        taskTitle.trim(),
        taskDescription.trim(),
        taskTimeRequired.trim(),
      );
      // Keep state sync'd with the newly created task (and ensure correct status)
      setTasks((current) => [...current, { ...task, status: taskStatus }]);
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleOpenEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditTimeRequired(task.time_required);
    setEditStatus(task.status);
    setIsEditOpen(true);
  };

  const handleEditTaskSubmit = async () => {
    if (!selectedTask || !editTitle.trim()) return;
    try {
      const updated = await updateTask(
        selectedTask.id,
        editTitle.trim(),
        editDescription.trim(),
        editTimeRequired.trim(),
        editStatus,
      );
      setTasks((current) =>
        current.map((t) => (t.id === updated.id ? updated : t)),
      );
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDeleteTaskSubmit = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      setTasks((current) => current.filter((t) => t.id !== selectedTask.id));
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const getTaskCountByStatus = (status: string): number => {
    return tasks.filter((task) => task.status === status).length;
  };

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  // Map Task to KanbanItem properties for Kibo-UI board
  const kanbanData: KanbanItem[] = tasks.map((task) => ({
    id: task.id.toString(),
    name: task.title,
    column: task.status,
    rawTask: task,
    date: formatDate(task.created_at),
    logTime: getLoggedTime(task.time_required, task.id),
    commentCount: getCommentCount(task.id),
  }));

  return <div>Kanban Tasks</div>;
}
