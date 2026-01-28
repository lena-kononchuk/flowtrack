<template>
  <div>
    <AppHeader />
    <div class="wrapper">
      <button class="button button--secondary box" @click="$router.push('/')">
        Back to Projects
      </button>

      <div v-if="loading">Loading...</div>
      <div v-else-if="!project">Project not found</div>

      <div v-else>
        <!-- Project Info -->
        <div class="card box2">
          <div class="flex middle-xs between-xs box">
            <h1 class="subtitle">{{ project.name }}</h1>
            <div class="flex gap middle-xs">
              <label class="text">Status:</label>
              <div class="relative">
                <select
                  v-model="project.status"
                  @change="updateProjectStatus"
                  class="select"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text box-small">Description</h3>
            <p>{{ project.fullDescription || 'No description' }}</p>
          </div>
        </div>

        <!-- View Mode Toggle -->
        <div class="flex middle-xs between-xs box2">
          <h2 class="subtitle">Tasks</h2>
          <div class="flex middle-xs gap">
            <button
              @click="viewMode = 'table'"
              :class="['button', viewMode === 'table' ? 'button--primary' : 'button--secondary']"
            >
              Table View
            </button>
            <button
              @click="viewMode = 'kanban'"
              :class="['button', viewMode === 'kanban' ? 'button--primary' : 'button--secondary']"
            >
              Kanban View
            </button>
          </div>
        </div>

        <!-- Table View -->
        <TasksTable
          v-if="viewMode === 'table'"
          :tasks="projectTasks"
          @edit-task="editTask"
          @add-task="openTaskModal('todo')"
          @update-task-order="handleUpdateTaskOrder"
        />

        <!-- Kanban View -->
        <div v-else class="row box">
          <TaskColumn
            v-for="column in taskColumns"
            :key="column.status"
            :title="column.title"
            :status="column.status"
            :tasks="tasksByStatus[column.status]"
            @edit-task="editTask"
            @add-task="openTaskModal(column.status)"
            @task-moved="handleTaskMoved"
          />
        </div>
      </div>
    </div>

    <CreateTaskModal
      :is-open="isTaskModalOpen"
      :project-id="projectId"
      :initial-status="taskModalStatus"
      :edit-task="editingTask"
      @close="isTaskModalOpen = false; editingTask = null"
      @submit="handleCreateTask"
      @update="handleUpdateTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectsStore } from '@/stores/projects.store';
import { useTasksStore } from '@/stores/tasks.store';
import { UseNotifications } from '@/composables/UseNotifications';
import AppHeader from '@/components/common/AppHeader.vue';
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue';
import TaskColumn from '@/components/tasks/TaskColumn.vue';
import TasksTable from '@/components/tasks/TasksTable.vue';
import type { Task } from '@/types/task.types';

const route = useRoute();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const { success, error } = UseNotifications();

const loading = ref(true);
const projectId = Number(route.params.id);
const isTaskModalOpen = ref(false);
const taskModalStatus = ref('todo');
const editingTask = ref<Task | null>(null);

// Load view mode from localStorage
const viewMode = ref<'table' | 'kanban'>(
  (localStorage.getItem('tasks-view-mode') as 'table' | 'kanban') || 'kanban'
);

// Save view mode to localStorage when changed
watch(viewMode, (mode) => localStorage.setItem('tasks-view-mode', mode));

const taskColumns = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' }
];

const project = computed(() =>
  projectsStore.projects.find(project => project.id === projectId)
);

const projectTasks = computed(() =>
  tasksStore.tasks.filter(task => task.projectId === projectId)
);

// Group tasks by status for Kanban view
const tasksByStatus = computed(() => {
  const result: Record<string, Task[]> = {
    'todo': [],
    'in-progress': [],
    'done': []
  };

  projectTasks.value.forEach(task => {
    if (result[task.status]) {
      result[task.status].push(task);
    }
  });

  // Sort tasks by order within each status
  Object.keys(result).forEach(status => {
    result[status].sort((firstTask, secondTask) => firstTask.order - secondTask.order);
  });

  return result;
});

// Load data on mount with error handling
onMounted(async () => {
  try {
    console.log('Loading data for project:', projectId);

    // Load projects first
    await projectsStore.fetchProjects();
    console.log('Projects loaded:', projectsStore.projects.length);

    // Load tasks
    await tasksStore.fetchTasks();
    console.log('Tasks loaded:', tasksStore.tasks.length);

    // Check if project exists
    if (!project.value) {
      error('Project not found');
    }

  } catch (loadError) {
    console.error('Error loading data:', loadError);
    error('Failed to load data');
  } finally {
    loading.value = false;
  }
});

// Update project status
async function updateProjectStatus() {
  if (!project.value) return;

  try {
    await projectsStore.updateProject(projectId, { status: project.value.status });
    success('Project status updated');
  } catch (updateError) {
    console.error('Error updating project status:', updateError);
    error('Failed to update project status');
  }
}

// Open task modal for creation
function openTaskModal(status: string) {
  taskModalStatus.value = status;
  editingTask.value = null;
  isTaskModalOpen.value = true;
}

// Open task modal for editing
function editTask(task: Task) {
  editingTask.value = task;
  taskModalStatus.value = task.status;
  isTaskModalOpen.value = true;
}

// Handle task creation
async function handleCreateTask(data: any) {
  try {
    // Calculate order for new task
    const tasksInStatus = projectTasks.value.filter(task => task.status === data.status);
    const maxOrder = tasksInStatus.length > 0
      ? Math.max(...tasksInStatus.map(task => task.order))
      : -1;

    await tasksStore.createTask({
      projectId: data.projectId,
      name: data.name,
      status: data.status,
      dueDate: data.dueDate,
      order: maxOrder + 1,
      ...(data.description && { description: data.description }),
      ...(data.assignee && { assignee: data.assignee })
    });

    success('Task created successfully');
  } catch (createError) {
    console.error('Error creating task:', createError);
    error('Failed to create task');
  }
}

// Handle task update
async function handleUpdateTask(taskId: number | string, data: any) {
  try {
    await tasksStore.updateTask(taskId, {
      name: data.name,
      status: data.status,
      dueDate: data.dueDate,
      ...(data.description && { description: data.description }),
      ...(data.assignee && { assignee: data.assignee })
    });

    success('Task updated successfully');
  } catch (updateError) {
    console.error('Error updating task:', updateError);
    error('Failed to update task');
  }
}

// Handle task moved in Kanban (drag-and-drop)
async function handleTaskMoved(taskId: number | string, newStatus: string, newOrder: number) {
  if (!taskId || taskId === '' || (typeof taskId === 'number' && isNaN(taskId))) {
    console.error('Invalid taskId:', taskId);
    error('Failed to move task');
    return;
  }

  try {
    // Find the moved task
    const movedTask = projectTasks.value.find(task => task.id === taskId);
    if (!movedTask) {
      error('Task not found');
      return;
    }

    const oldStatus = movedTask.status;
    const oldOrder = movedTask.order;

    // If task moved to the same position, do nothing
    if (oldStatus === newStatus && oldOrder === newOrder) {
      return;
    }

    // Collect all update promises
    const updatePromises: Promise<any>[] = [];

    // Update moved task
    updatePromises.push(
      tasksStore.updateTask(taskId, {
        status: newStatus as 'todo' | 'in-progress' | 'done',
        order: newOrder
      })
    );

    // Reorder tasks in NEW status column
    const tasksInNewStatus = projectTasks.value
      .filter(task => task.status === newStatus && task.id !== taskId)
      .sort((firstTask, secondTask) => firstTask.order - secondTask.order);

    tasksInNewStatus.forEach((task, index) => {
      const calculatedOrder = index >= newOrder ? index + 1 : index;
      if (task.order !== calculatedOrder) {
        updatePromises.push(
          tasksStore.updateTask(task.id, { order: calculatedOrder })
        );
      }
    });

    // If moved between different statuses, reorder old status column
    if (oldStatus !== newStatus) {
      const tasksInOldStatus = projectTasks.value
        .filter(task => task.status === oldStatus && task.id !== taskId)
        .sort((firstTask, secondTask) => firstTask.order - secondTask.order);

      tasksInOldStatus.forEach((task, index) => {
        if (task.order !== index) {
          updatePromises.push(
            tasksStore.updateTask(task.id, { order: index })
          );
        }
      });
    }

    await Promise.all(updatePromises);
    success('Task moved successfully');
  } catch (moveError) {
    console.error('Failed to move task:', moveError);
    error('Failed to move task');
  }
}

// Handle task order update in table (drag-and-drop)
async function handleUpdateTaskOrder(tasks: Task[]) {
  try {
    const promises = tasks.map((task, index) => {
      if (task.order !== index) {
        return tasksStore.updateTask(task.id, { order: index });
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
    success('Task order updated');
  } catch (updateError) {
    console.error('Error updating task order:', updateError);
    error('Failed to update task order');
  }
}
</script>
