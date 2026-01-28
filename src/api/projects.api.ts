// src/api/projects.api.ts
import apiClient from './axios.config';
import type { Project } from '@/types/project.types';

export const projectsApi = {
  async getAll(): Promise<Project[]> {
    console.log('📡 [projectsApi.getAll] Called');

    if (import.meta.env.PROD) {
      const url = '/FlowBoard-New/api/projects.json';
      console.log('🌐 [PROD] Fetching from:', url);

      try {
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [PROD] Projects data:', data);

        if (!Array.isArray(data)) {
          console.error('❌ Data is not an array:', data);
          return [];
        }

        return data;
      } catch (error) {
        console.error('❌ [PROD] Error:', error);
        return [];
      }
    } else {
      console.log('💻 [DEV] Using axios...');
      try {
        const response = await apiClient.get('/projects');
        console.log('✅ [DEV] Projects data:', response.data);

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

  async getById(id: string): Promise<Project | undefined> {
    try {
      const projects = await this.getAll();
      return projects.find(project => project.id.toString() === id.toString());
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return undefined;
    }
  },

  create(project: Omit<Project, 'id'>) {
    if (!import.meta.env.PROD) {
      return apiClient.post<Project>('/projects', project);
    }
    return Promise.reject(new Error('Create not supported in production'));
  },

  update(id: number, project: Partial<Project>) {
    if (!import.meta.env.PROD) {
      return apiClient.patch<Project>(`/projects/${id}`, project);
    }
    return Promise.reject(new Error('Update not supported in production'));
  },

  delete(id: number) {
    if (!import.meta.env.PROD) {
      return apiClient.delete(`/projects/${id}`);
    }
    return Promise.reject(new Error('Delete not supported in production'));
  }
};
