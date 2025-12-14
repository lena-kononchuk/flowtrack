<template>
  <div class="col-xs-12 col-sm-4">
    <div class="card box">
      <!-- Header with title and task count -->
      <div class="flex middle-xs between-xs box">
        <div>
          <h3 class="subtitle">{{ title }}</h3>
          <span class="text gray">{{ localTasks.length }} tasks</span>
        </div>
      </div>

      <!-- Draggable tasks list with minimum height -->
      <div class="draggable-container">
        <draggable
          v-model="localTasks"
          :group="{ name: 'tasks', pull: true, put: true }"
          item-key="id"
          @change="handleChange"
          class="draggable-list"
        >
          <template #item="{ element: task }">
            <div class="card card__white box pointer">
              <!-- Task name -->
              <div class="box-small">
                <div class="text bold black box-small" @click="$emit('edit-task', task)">
                  {{ task.name }}
                </div>
              </div>
              
              <!-- Task description (if exists) -->
              <div v-if="task.description" class="text gray box">
                {{ task.description }}
              </div>

              <!-- Task assignee (if exists) -->
              <div class="box-small">
                <div v-if="task.assignee" class="text gray">
                  <i class="fas fa-user"></i>
                  {{ task.assignee }}
                </div>
              </div>

              <!-- Task due date and edit button -->
              <div class="flex middle-xs between-xs box-small">
                <div class="text gray">
                  <i class="fas fa-calendar"></i>
                  {{ new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                </div>
                <button 
                  class="button button--icon" 
                  @click.stop="$emit('edit-task', task)"
                  title="Edit task"
                >
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <!-- Empty state when no tasks -->
        <div v-if="localTasks.length === 0" class="empty-state">
          <p class="text gray">No tasks</p>
        </div>
      </div>

      <!-- Add task button -->
      <button class="button button--secondary button__full box" @click="$emit('add-task')">
        <i class="fas fa-plus"></i>
        Add Task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import type { Task } from '@/types/task.types';

const props = defineProps<{
  title: string;
  status: string;
  tasks: Task[];
}>();

const emit = defineEmits<{
  'edit-task': [task: Task];
  'add-task': [];
  'task-moved': [taskId: number | string, newStatus: string, newOrder: number];
}>();

// Local mutable copy of tasks for draggable
const localTasks = ref<Task[]>([...props.tasks]);

// Sync localTasks with props.tasks when they change
watch(() => props.tasks, (newTasks) => {
  localTasks.value = [...newTasks];
}, { deep: true });

/**
 * Handle drag-and-drop change events
 */
function handleChange(event: any) {
  console.log(`[${props.status}] handleChange:`, event);
  
  // Handle task added to this column
  if (event.added) {
    const task = event.added.element;
    const taskId = task?.id;
    
    console.log(`[${props.status}] Task ADDED:`, { 
      taskId, 
      newStatus: props.status, 
      newIndex: event.added.newIndex 
    });
    
    if (!taskId || taskId === '' || (typeof taskId === 'number' && isNaN(taskId))) {
      console.error('Invalid task ID on add:', task);
      return;
    }
    
    emit('task-moved', taskId, props.status, event.added.newIndex);
  }
  
  // Handle task moved within this column
  if (event.moved) {
    const task = event.moved.element;
    const taskId = task?.id;
    
    console.log(`[${props.status}] Task MOVED within column:`, { 
      taskId, 
      newIndex: event.moved.newIndex 
    });
    
    if (!taskId || taskId === '' || (typeof taskId === 'number' && isNaN(taskId))) {
      console.error('Invalid task ID on move:', task);
      return;
    }
    
    emit('task-moved', taskId, props.status, event.moved.newIndex);
  }
}
</script>
