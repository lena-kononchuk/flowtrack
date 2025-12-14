import apiClient from './axios.config';
import type { Project } from '@/types/project.types';

export const projectsApi = {
  getAll() {
    return apiClient.get<Project[]>('/projects');
  },

  getById(id: number) {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  create(project: Omit<Project, 'id' | 'createdAt'>) {
    return apiClient.post<Project>('/projects', {
      ...project,
      createdAt: new Date().toISOString()
    });
  },

  update(id: number, project: Partial<Project>) {
    return apiClient.patch<Project>(`/projects/${id}`, project);
  },

  delete(id: number) {
    return apiClient.delete(`/projects/${id}`);
  }
};