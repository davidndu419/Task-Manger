import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { Category, Priority, Task, TaskFilter, TaskStatus } from "@/types/task";

const STORAGE_KEY = "taskmaster_tasks";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function makeDemoTasks(): Task[] {
  const now = Date.now();
  const h = (hours: number) => new Date(now + hours * 60 * 60 * 1000).toISOString();
  const d = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: generateId(),
      title: "Submit GES400 Project Report",
      description: "Finalise the To-Do List with Reminder project write-up and upload to the portal.",
      priority: "high",
      category: "education",
      deadline: h(4),
      status: "pending",
      reminderEnabled: true,
      reminderMinutesBefore: 30,
      createdAt: d(-1),
    },
    {
      id: generateId(),
      title: "Complete Lab Report for CHM201",
      description: "Write up experiment results and conclusion for the chemistry lab session.",
      priority: "high",
      category: "education",
      deadline: h(-6),
      status: "overdue",
      reminderEnabled: true,
      reminderMinutesBefore: 60,
      createdAt: d(-3),
    },
    {
      id: generateId(),
      title: "Team Meeting – Project Demo Rehearsal",
      description: "Meet with project group to rehearse the live demo and divide presentation roles.",
      priority: "medium",
      category: "work",
      deadline: d(1),
      status: "pending",
      reminderEnabled: true,
      reminderMinutesBefore: 30,
      createdAt: d(-1),
    },
    {
      id: generateId(),
      title: "Pay School Fee Balance",
      description: "Clear outstanding balance at the bursary before the deadline.",
      priority: "high",
      category: "finance",
      deadline: d(2),
      status: "pending",
      reminderEnabled: true,
      reminderMinutesBefore: 1440,
      createdAt: d(-2),
    },
    {
      id: generateId(),
      title: "Visit Campus Health Centre",
      description: "Routine check-up appointment booked for this week.",
      priority: "medium",
      category: "health",
      deadline: d(3),
      status: "pending",
      reminderEnabled: true,
      reminderMinutesBefore: 60,
      createdAt: d(-1),
    },
    {
      id: generateId(),
      title: "Buy Stationery for Exams",
      description: "Pens, highlighters, and a scientific calculator from the bookshop.",
      priority: "low",
      category: "shopping",
      deadline: d(5),
      status: "pending",
      reminderEnabled: false,
      reminderMinutesBefore: 30,
      createdAt: d(-1),
    },
    {
      id: generateId(),
      title: "Register for Next Semester Courses",
      description: "Select and confirm course units on the student portal.",
      priority: "medium",
      category: "education",
      deadline: d(-2),
      status: "completed",
      reminderEnabled: false,
      reminderMinutesBefore: 30,
      createdAt: d(-5),
      completedAt: d(-1),
    },
  ] as Task[];
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "status">) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  clearAllTasks: () => Promise<void>;
  loadDemoTasks: () => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByDate: (date: string) => Task[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completedToday: number;
    completedThisWeek: number;
    byCategory: Record<Category, number>;
    byPriority: Record<Priority, number>;
  };
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>({ status: "all", priority: "all", category: "all", search: "" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      const now = new Date();
      if (data) {
        const parsed: Task[] = JSON.parse(data);
        const updated = parsed.map((t) => {
          if (t.status === "pending" && new Date(t.deadline) < now) {
            return { ...t, status: "overdue" as TaskStatus };
          }
          return t;
        });
        setTasks(updated);
      } else {
        const demo = makeDemoTasks();
        setTasks(demo);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (newTasks: Task[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  }, []);

  useEffect(() => {
    if (loaded) {
      persist(tasks);
    }
  }, [tasks, loaded, persist]);

  const addTask = useCallback(async (taskData: Omit<Task, "id" | "createdAt" | "status">) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: new Date(taskData.deadline) < new Date() ? "overdue" : "pending",
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updated.status === "pending" && new Date(updated.deadline) < new Date()) {
          updated.status = "overdue";
        }
        return updated;
      })
    );
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompletedTasks = useCallback(async () => {
    setTasks((prev) => prev.filter((t) => t.status !== "completed"));
  }, []);

  const clearAllTasks = useCallback(async () => {
    setTasks([]);
  }, []);

  const loadDemoTasks = useCallback(async () => {
    const demo = makeDemoTasks();
    setTasks((prev) => [...prev, ...demo]);
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "completed") {
          const status: TaskStatus = new Date(t.deadline) < new Date() ? "overdue" : "pending";
          return { ...t, status, completedAt: undefined };
        }
        return { ...t, status: "completed" as TaskStatus, completedAt: new Date().toISOString() };
      })
    );
  }, []);

  const getTaskById = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  const getTasksByDate = useCallback(
    (date: string) => {
      const toLocal = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const target = toLocal(new Date(date));
      return tasks.filter((t) => toLocal(new Date(t.deadline)) === target);
    },
    [tasks]
  );

  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];
    if (filter.status && filter.status !== "all") {
      result = result.filter((t) => t.status === filter.status);
    }
    if (filter.priority && filter.priority !== "all") {
      result = result.filter((t) => t.priority === filter.priority);
    }
    if (filter.category && filter.category !== "all") {
      result = result.filter((t) => t.category === filter.category);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    const statusOrder: Record<TaskStatus, number> = { overdue: 0, pending: 1, completed: 2 };
    result.sort((a, b) => {
      const sd = statusOrder[a.status] - statusOrder[b.status];
      if (sd !== 0) return sd;
      const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pd !== 0) return pd;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
    return result;
  }, [tasks, filter]);

  const stats = React.useMemo(() => {
    const now = new Date();
    const toLocal = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const todayStr = toLocal(now);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const byCategory = {} as Record<Category, number>;
    const byPriority = {} as Record<Priority, number>;
    (["work", "personal", "health", "shopping", "finance", "education", "other"] as Category[]).forEach(
      (c) => (byCategory[c] = 0)
    );
    (["high", "medium", "low"] as Priority[]).forEach((p) => (byPriority[p] = 0));

    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let completedToday = 0;
    let completedThisWeek = 0;

    for (const t of tasks) {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      if (t.status === "completed") {
        completed++;
        if (t.completedAt) {
          if (toLocal(new Date(t.completedAt)) === todayStr) completedToday++;
          if (new Date(t.completedAt) >= weekAgo) completedThisWeek++;
        }
      } else if (t.status === "overdue") {
        overdue++;
      } else {
        pending++;
      }
    }

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      completedToday,
      completedThisWeek,
      byCategory,
      byPriority,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        filter,
        setFilter,
        addTask,
        updateTask,
        deleteTask,
        clearCompletedTasks,
        clearAllTasks,
        loadDemoTasks,
        toggleComplete,
        getTaskById,
        getTasksByDate,
        stats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
