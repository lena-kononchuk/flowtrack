// src/api/tasks.api.ts
import apiClient from './axios.config';
import type { Task } from '@/types/task.types';

export const tasksApi = {
  async getAll(): Promise<Task[]> {
    console.log('📡 [tasksApi.getAll] Called');

    if (import.meta.env.PROD) {
      // Для GitHub Pages
      const url = '/FlowBoard-New/api/tasks.json';
      console.log('🌐 [PROD] Fetching from:', url);

      try {
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [PROD] Tasks data:', data);

        // УБЕДИТЕСЬ, что возвращаем массив
        if (!Array.isArray(data)) {
          console.error('❌ Data is not an array:', data);
          return [];
        }

        return data;
      } catch (error) {
        console.error('❌ [PROD] Error:', error);
        return []; // Возвращаем пустой массив вместо ошибки
      }
    } else {
      // Для локальной разработки
      console.log('💻 [DEV] Using axios...');
      try {
        const response = await apiClient.get('/tasks');
        console.log('✅ [DEV] Tasks data:', response.data);

        if (!Array.isArray(response.data)) {
          console.error('❌ Response data is not an array:', response.data);
          return [];
        }

        return response.data;
      } catch (error) {
        console.error('❌ [DEV] Error:', error);
        return [];
      }
    }
  },

  async getByProjectId(projectId: string): Promise<Task[]> {
    try {
      const allTasks = await this.getAll();
      return allTasks.filter(task =>
        task.projectId.toString() === projectId.toString()
      );
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      return [];
    }
  },

  create(task: Omit<Task, 'id'>) {
    if (!import.meta.env.PROD) {
      return apiClient.post<Task>('/tasks', task);
    }
    return Promise.reject(new Error('Create not supported in production'));
  },

  update(id: number, task: Partial<Task>) {
    if (!import.meta.env.PROD) {
      return apiClient.patch<Task>(`/tasks/${id}`, task);
    }
    return Promise.reject(new Error('Update not supported in production'));
  },

  delete(id: number) {
    if (!import.meta.env.PROD) {
      return apiClient.delete(`/tasks/${id}`);
    }
    return Promise.reject(new Error('Delete not supported in production'));
  }
};
