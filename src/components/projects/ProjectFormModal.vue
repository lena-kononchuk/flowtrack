<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal__overlay" @click.self="$emit('close')">
      <div class="modal__container">
        <h2 class="subtitle box">{{ editProject ? 'Edit Project' : 'Create New Project' }}</h2>
        
        <form @submit.prevent="submit">
          <!-- Project Name Field -->
          <div class="box">
            <div class="text box-small">Project Name *</div>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter project name"
              required
              class="form__input"
            />
            <span v-if="errors.name" class="form__error">{{ errors.name }}</span>
          </div>

          <!-- Project Description Field -->
          <div class="box">
            <div class="text box-small">Description</div>
            <textarea
              v-model="form.shortDescription"
              placeholder="Enter project description"
              rows="4"
              class="form__textarea"
            ></textarea>
          </div>

          <!-- Modal Actions -->
          <div class="modal__actions">
            <button type="button" class="button button--secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="button button--primary">
              {{ editProject ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Project } from '@/types/project.types';

const props = defineProps<{
  isOpen: boolean;
  editProject?: Project | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: { name: string; shortDescription?: string }];
  update: [projectId: number, data: { name: string; shortDescription?: string }];
}>();

/**
 * Form data object
 */
const form = ref({ name: '', shortDescription: '' });

/**
 * Form validation errors
 */
const errors = ref({ name: '' });

/**
 * Watch modal open state to reset/populate form
 */
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.editProject) {
      // Populate form with existing project data
      form.value.name = props.editProject.name;
      form.value.shortDescription = props.editProject.shortDescription || '';
    } else {
      // Reset form for new project
      form.value = { name: '', shortDescription: '' };
    }
    errors.value = { name: '' };
  }
});

/**
 * Submit form with validation
 * Creates new project or updates existing one
 */
function submit() {
  // Validate project name
  if (!form.value.name.trim()) {
    errors.value.name = "Project name is required";
    return;
  }

  // Prepare data object
  const data = {
    name: form.value.name,
    shortDescription: form.value.shortDescription || undefined
  };

  // Emit appropriate event based on create/edit mode
  if (props.editProject) {
    emit('update', props.editProject.id, data);
  } else {
    emit('submit', data);
  }
  
  emit('close');
}
</script>