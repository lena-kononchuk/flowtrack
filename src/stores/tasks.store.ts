import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tasksApi } from '@/api/tasks.api';
import type { Task } from '@/types/task.types';

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all tasks from API
   */
  async function fetchTasks() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await tasksApi.getAll();
      tasks.value = response.data.map(task => ({
        ...task,
        id: task.id,
        projectId: Number(task.projectId)
      }));
      saveToLocalStorage();
    } catch (fetchError) {
      error.value = 'Failed to fetch tasks';
      console.error('Fetch tasks error:', fetchError);
      throw fetchError;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create new task
   * @param data - Task data without id and createdAt
   * @returns Promise with created task
   */
  async function createTask(data: Omit<Task, 'id' | 'createdAt'>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await tasksApi.create(data);
      
      // Validate that task was created with ID
      if (!response.data.id) {
        throw new Error('Task created without ID');
      }
      
      // Add task to store
      tasks.value.push({
        ...response.data,
        id: response.data.id,
        projectId: Number(response.data.projectId)
      });
      
      saveToLocalStorage();
      return response.data;
    } catch (createError) {
      error.value = 'Failed to create task';
      console.error('Create task error:', createError);
      throw createError;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update existing task with optimistic update
   * @param taskId - Task ID (can be string or number)
   * @param updates - Partial task data to update
   * @returns Promise with updated task data
   */
/**
 * Update existing task with optimistic update
 * @param taskId - Task ID (can be string or number)
 * @param updates - Partial task data to update
 * @returns Promise with updated task data
 */
async function updateTask(taskId: number | string, updates: Partial<Task>) {
  // Validate task ID
  if (!taskId || (typeof taskId === 'number' && isNaN(taskId))) {
    console.error('Invalid task ID in updateTask:', taskId);
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    // Find task index in store
    const taskIndex = tasks.value.findIndex(task => task.id == taskId);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    // Optimistic update: update locally BEFORE API request
    tasks.value[taskIndex] = {
      ...tasks.value[taskIndex],
      ...updates,
      id: tasks.value[taskIndex].id, // preserve original ID
      projectId: tasks.value[taskIndex].projectId // preserve projectId
    };
    saveToLocalStorage();

    // Send update to backend
    const response = await tasksApi.update(taskId as any, updates);
    
    // Sync with server response
    tasks.value[taskIndex] = {
      ...tasks.value[taskIndex],
      ...response.data,
      id: response.data.id,
      projectId: Number(response.data.projectId)
    };
    saveToLocalStorage();
    
    return response.data;
  } catch (updateError) {
    error.value = 'Failed to update task';
    console.error('Update task error:', updateError);
    
    // Rollback to original state on error
    await fetchTasks();
    throw updateError;
  } finally {
    loading.value = false;
  }
}

  /**
   * Delete task by ID
   * @param taskId - Task ID to delete
   */
  async function deleteTask(taskId: number | string) {
    loading.value = true;
    error.value = null;
    
    try {
      await tasksApi.delete(taskId as any);
      tasks.value = tasks.value.filter(task => task.id != taskId);
      saveToLocalStorage();
    } catch (deleteError) {
      error.value = 'Failed to delete task';
      console.error('Delete task error:', deleteError);
      throw deleteError;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Save tasks to localStorage for persistence
   */
  function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks.value));
  }

  /**
   * Load tasks from localStorage
   * Used for initial state hydration
   */
  function loadFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        tasks.value = parsedTasks.map((task: any) => ({
          ...task,
          id: task.id,
          projectId: Number(task.projectId)
        }));
      } catch (parseError) {
        console.error('Failed to parse tasks from localStorage:', parseError);
      }
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    loadFromLocalStorage
  };
});