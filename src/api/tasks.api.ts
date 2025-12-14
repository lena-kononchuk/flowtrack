import apiClient from './axios.config';
import type { Task } from '@/types/task.types';

export const tasksApi = {
  getAll() {
    return apiClient.get<Task[]>('/tasks');
  },

  getByProjectId(projectId: number) {
    return apiClient.get<Task[]>(`/tasks?projectId=${projectId}`);
  },

  create(task: Omit<Task, 'id'>) {
    return apiClient.post<Task>('/tasks', task);
  },

  update(id: number, task: Partial<Task>) {
    return apiClient.patch<Task>(`/tasks/${id}`, task);
  },

  delete(id: number) {
    return apiClient.delete(`/tasks/${id}`);
  }
};