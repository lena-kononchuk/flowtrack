import { defineStore } from 'pinia';
import { ref } from 'vue';
import { projectsApi } from '@/api/projects.api';
import type { Project } from '@/types/project.types';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all projects from API
   */
  async function fetchProjects() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await projectsApi.getAll();
      projects.value = response.data.map(project => ({
        ...project,
        id: Number(project.id)
      }));
      saveToLocalStorage();
    } catch (err) {
      error.value = 'Failed to fetch projects';
      console.error('Fetch projects error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create new project
   * @param data - Project data (name, description, status)
   * @returns Promise with created project
   */
  async function createProject(data: { name: string; shortDescription?: string; status: string }) {
    loading.value = true;
    error.value = null;
    
    try {
      // Prepare data for API (without id and createdAt)
      const apiData = {
        name: data.name,
        shortDescription: data.shortDescription,
        status: data.status as 'pending' | 'active' | 'completed' | 'planned'
      };

      const response = await projectsApi.create(apiData);
      
      projects.value.push({
        ...response.data,
        id: Number(response.data.id)
      });
      
      saveToLocalStorage();
      return response.data;
    } catch (err) {
      error.value = 'Failed to create project';
      console.error('Create project error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update existing project
   * @param id - Project ID
   * @param updates - Partial project data to update
   */
  async function updateProject(id: number, updates: Partial<Project>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await projectsApi.update(id, updates);
      
      // Find and update project in store
      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...response.data,
          id: Number(response.data.id)
        };
        saveToLocalStorage();
      }
      
      return response.data;
    } catch (err) {
      error.value = 'Failed to update project';
      console.error('Update project error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete project by ID
   * @param id - Project ID to delete
   */
  async function deleteProject(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await projectsApi.delete(id);
      projects.value = projects.value.filter(p => p.id !== id);
      saveToLocalStorage();
    } catch (err) {
      error.value = 'Failed to delete project';
      console.error('Delete project error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Save projects to localStorage
   */
  function saveToLocalStorage() {
    localStorage.setItem('projects', JSON.stringify(projects.value));
  }

  /**
   * Load projects from localStorage
   */
  function loadFromLocalStorage() {
    const stored = localStorage.getItem('projects');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        projects.value = parsed.map((project: any) => ({
          ...project,
          id: Number(project.id)
        }));
      } catch (err) {
        console.error('Failed to parse projects from localStorage:', err);
      }
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    loadFromLocalStorage
  };
});