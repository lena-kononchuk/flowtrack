// src/stores/projects.store.ts
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
      const data = await projectsApi.getAll();
      projects.value = data.map(project => ({
        ...project,
        id: project.id
      }));
      saveToLocalStorage();
    } catch (fetchError) {
      error.value = 'Failed to fetch projects';
      console.error('Fetch projects error:', fetchError);
      throw fetchError;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create new project
   */
  async function createProject(data: Omit<Project, 'id' | 'createdAt'>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await projectsApi.create(data);

      if (!response.data.id) {
        throw new Error('Project created without ID');
      }

      projects.value.push({
        ...response.data,
        id: response.data.id
      });

      saveToLocalStorage();
      return response.data;
    } catch (createError) {
      error.value = 'Failed to create project';
      console.error('Create project error:', createError);
      throw createError;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update existing project
   */
  async function updateProject(projectId: number | string, updates: Partial<Project>) {
    if (!projectId) {
      console.error('Invalid project ID in updateProject:', projectId);
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const projectIndex = projects.value.findIndex(project => project.id == projectId);
      if (projectIndex === -1) {
        throw new Error(`Project with id ${projectId} not found`);
      }

      // Optimistic update
      projects.value[projectIndex] = {
        ...projects.value[projectIndex],
        ...updates,
        id: projects.value[projectIndex].id
      };
      saveToLocalStorage();

      const response = await projectsApi.update(projectId as any, updates);

      projects.value[projectIndex] = {
        ...projects.value[projectIndex],
        ...response.data,
        id: response.data.id
      };
      saveToLocalStorage();

      return response.data;
    } catch (updateError) {
      error.value = 'Failed to update project';
      console.error('Update project error:', updateError);
      await fetchProjects();
      throw updateError;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete project by ID
   */
  async function deleteProject(projectId: number | string) {
    loading.value = true;
    error.value = null;

    try {
      await projectsApi.delete(projectId as any);
      projects.value = projects.value.filter(project => project.id != projectId);
      saveToLocalStorage();
    } catch (deleteError) {
      error.value = 'Failed to delete project';
      console.error('Delete project error:', deleteError);
      throw deleteError;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Save projects to localStorage for persistence
   */
  function saveToLocalStorage() {
    localStorage.setItem('projects', JSON.stringify(projects.value));
  }

  /**
   * Load projects from localStorage
   */
  function loadFromLocalStorage() {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      try {
        const parsedProjects = JSON.parse(storedProjects);
        projects.value = parsedProjects.map((project: any) => ({
          ...project,
          id: project.id
        }));
      } catch (parseError) {
        console.error('Failed to parse projects from localStorage:', parseError);
      }
    }
  }

  /**
   * Get project by ID
   */
  function getProjectById(id: string) {
    return projects.value.find(project => project.id.toString() === id.toString());
  }

  /**
   * Get task counts for all projects
   */
  function getTaskCounts(tasks: any[]) {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      const projectId = task.projectId.toString();
      counts[projectId] = (counts[projectId] || 0) + 1;
    });
    return counts;
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    loadFromLocalStorage,
    getProjectById,
    getTaskCounts
  };
});
