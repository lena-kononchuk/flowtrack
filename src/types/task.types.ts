export interface Task {
  id: number | string;  
  projectId: number;
  name: string;
  description?: string;
  assignee?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  order: number;
  createdAt?: string;
}