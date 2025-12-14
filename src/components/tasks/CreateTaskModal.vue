<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal__overlay" @click.self="$emit('close')">
      <div class="modal__container">
        <h2 class="subtitle box">{{ editTask ? 'Edit Task' : 'Create New Task' }}</h2>
        
        <form @submit.prevent="submit">
          <!-- Task Name Field -->
          <div class="box">
            <div class="text box-small">Task Name *</div>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter task name (3-120 characters)"
              minlength="3"
              maxlength="120"
              required
              class="form__input"
            />
            <span v-if="errors.name" class="form__error">{{ errors.name }}</span>
          </div>

          <!-- Description Field -->
          <div class="box">
            <div class="text box-small">Description</div>
            <textarea
              v-model="form.description"
              placeholder="Enter task description"
              rows="3"
              class="form__textarea"
            ></textarea>
          </div>

          <!-- Assignee Field -->
          <div class="box">
            <div class="text box-small">Assignee</div>
            <div class="relative">
              <select v-model="form.assignee" class="select">
                <option value="">No assignee</option>
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
                <option value="Mike Johnson">Mike Johnson</option>
                <option value="Sarah Williams">Sarah Williams</option>
              </select>
              <i class="fas fa-chevron-down form__select-icon"></i>
            </div>
          </div>

          <!-- Status Field -->
          <div class="box">
            <div class="text box-small">Status *</div>
            <div class="relative">
              <select v-model="form.status" class="select" required>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <i class="fas fa-chevron-down form__select-icon"></i>
            </div>
          </div>

          <!-- Due Date Field -->
          <div class="box">
            <div class="text box-small">Due Date *</div>
            <input
              v-model="form.dueDate"
              type="date"
              :min="new Date().toISOString().split('T')[0]"
              required
              class="form__input"
            />
            <span v-if="errors.dueDate" class="form__error">{{ errors.dueDate }}</span>
          </div>

          <!-- Modal Actions -->
          <div class="modal__actions">
            <button type="button" class="button button--secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="button button--primary">
              {{ editTask ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Task } from '@/types/task.types';

const props = defineProps<{
  isOpen: boolean;
  projectId: number;
  initialStatus?: string;
  editTask?: Task | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: {
    projectId: number;
    name: string;
    description?: string;
    assignee?: string;
    status: string;
    dueDate: string;
  }];
  update: [taskId: number | string, data: {
    name: string;
    description?: string;
    assignee?: string;
    status: string;
    dueDate: string;
  }];
}>();

/**
 * Form data object
 */
const form = ref({
  name: '',
  description: '',
  assignee: '',
  status: 'todo',
  dueDate: ''
});

/**
 * Form validation errors
 */
const errors = ref({ name: '', dueDate: '' });

/**
 * Watch modal open state to reset/populate form
 */
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.editTask) {
      // Populate form with existing task data
      form.value = {
        name: props.editTask.name,
        description: props.editTask.description || '',
        assignee: props.editTask.assignee || '',
        status: props.editTask.status,
        dueDate: props.editTask.dueDate
      };
    } else {
      // Reset form for new task
      form.value = {
        name: '',
        description: '',
        assignee: '',
        status: props.initialStatus || 'todo',
        dueDate: new Date().toISOString().split('T')[0]
      };
    }
    errors.value = { name: '', dueDate: '' };
  }
});

/**
 * Submit form with validation
 * Creates new task or updates existing one
 */
function submit() {
  errors.value = { name: '', dueDate: '' };

  // Validate task name
  if (!form.value.name.trim()) {
    errors.value.name = "Task name is required";
    return;
  }
  if (form.value.name.length < 3) {
    errors.value.name = "Task name must be at least 3 characters";
    return;
  }
  if (form.value.name.length > 120) {
    errors.value.name = "Task name must be less than 120 characters";
    return;
  }

  // Validate due date
  if (!form.value.dueDate) {
    errors.value.dueDate = "Due date is required";
    return;
  }
  
  const selectedDate = new Date(form.value.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    errors.value.dueDate = "Due date must be today or in the future";
    return;
  }

  // Prepare data object with optional fields
  const data = {
    name: form.value.name,
    status: form.value.status,
    dueDate: form.value.dueDate,
    ...(form.value.description && { description: form.value.description }),
    ...(form.value.assignee && { assignee: form.value.assignee })
  };

  // Emit appropriate event based on create/edit mode
  if (props.editTask) {
    emit('update', props.editTask.id, data);
  } else {
    emit('submit', { projectId: props.projectId, ...data });
  }
  
  emit('close');
}
</script>