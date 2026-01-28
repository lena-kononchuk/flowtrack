// src/api/projects.api.ts
import apiClient from './axios.config';
import type { Project } from '@/types/project.types';

export const projectsApi = {
  async getAll() {
    if (import.meta.env.PROD) {
      // On GitHub Pages - load from JSON file
      try {
        const response = await fetch('/FlowBoard-New/api/projects.json');
        if (!response.ok) throw new Error('Failed to fetch projects');
        return await response.json();
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
    } else {
      // Locally - via axios
      const response = await apiClient.get<Project[]>('/projects');
      return response.data;  // Return data directly, not response object
    }
  },

  async getById(id: string) {
    if (import.meta.env.PROD) {
      // On GitHub Pages - filter from all projects
      try {
        const projects = await this.getAll();
        return projects.find((project: Project) => project.id.toString() === id.toString());
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        throw error;
      }
    } else {
      // Locally
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response.data;
    }
  },

  // Other methods only for development
  create(project: Omit<Project, 'id'>) {
    if (!import.meta.env.PROD) {
      return apiClient.post<Project>('/projects', project);
    }
    throw new Error('Create project not supported in production');
  },

  update(id: number, project: Partial<Project>) {
    if (!import.meta.env.PROD) {
      return apiClient.patch<Project>(`/projects/${id}`, project);
    }
    throw new Error('Update project not supported in production');
  },

  delete(id: number) {
    if (!import.meta.env.PROD) {
      return apiClient.delete(`/projects/${id}`);
    }
    throw new Error('Delete project not supported in production');
  }
};
