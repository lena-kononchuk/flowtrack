// src/api/tasks.api.ts
import apiClient from './axios.config';
import type { Task } from '@/types/task.types';

export const tasksApi = {
  async getAll() {
    if (import.meta.env.PROD) {
      // On GitHub Pages
      try {
        const response = await fetch('/FlowBoard-New/api/tasks.json');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    } else {
      // Locally
      const response = await apiClient.get<Task[]>('/tasks');
      return response.data;
    }
  },

  async getByProjectId(projectId: string) {
    if (import.meta.env.PROD) {
      // On GitHub Pages - filter
      try {
        const allTasks = await this.getAll();
        return allTasks.filter((task: Task) =>
          task.projectId.toString() === projectId.toString()
        );
      } catch (error) {
        console.error(`Error fetching tasks for project ${projectId}:`, error);
        throw error;
      }
    } else {
      // Locally
      const response = await apiClient.get<Task[]>(`/tasks?projectId=${projectId}`);
      return response.data;
    }
  },

  // Other methods only for development
  create(task: Omit<Task, 'id'>) {
    if (!import.meta.env.PROD) {
      return apiClient.post<Task>('/tasks', task);
    }
    throw new Error('Create task not supported in production');
  },

  update(id: number, task: Partial<Task>) {
    if (!import.meta.env.PROD) {
      return apiClient.patch<Task>(`/tasks/${id}`, task);
    }
    throw new Error('Update task not supported in production');
  },

  delete(id: number) {
    if (!import.meta.env.PROD) {
      return apiClient.delete(`/tasks/${id}`);
    }
    throw new Error('Delete task not supported in production');
  }
};
