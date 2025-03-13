export type Priority = 'low' | 'medium' | 'high';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | null;
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  color?: string;
  notes?: string;
  dueDate?: string;
  pinned: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  priority: Priority;
  recurrence: RecurrencePattern;
  subtasks: Subtask[];
  progress: number;
  pomodoroCount?: number;
  pomodoroTarget?: number;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}