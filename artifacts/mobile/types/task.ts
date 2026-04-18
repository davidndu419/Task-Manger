export type Priority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "completed" | "overdue";
export type Category =
  | "work"
  | "personal"
  | "health"
  | "shopping"
  | "finance"
  | "education"
  | "other";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  category: Category;
  deadline: string;
  createdAt: string;
  completedAt?: string;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
}

export interface TaskFilter {
  status?: TaskStatus | "all";
  priority?: Priority | "all";
  category?: Category | "all";
  search?: string;
}
