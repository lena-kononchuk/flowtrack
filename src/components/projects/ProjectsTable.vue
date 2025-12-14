<template>
  <div>
    <div class="box">
      <div class="flex middle-xs between-xs">
        <h1 class="title">All Projects</h1>
        <button class="button button--primary" @click="isModalOpen = true">
          <i class="fas fa-plus"></i>
          Add Project
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="row box2">
      <div class="col-xs-12 col-sm-9 col-md-9">
        <div class="relative">
          <i class="fas fa-search filters--select-icon"></i>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search by project name..."
            class="form__input form__input--search"
          />
          <button v-if="searchInput" @click="clearSearch" class="button--clear">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="col-xs-12 col-sm-3 col-md-3">
        <div class="relative">
          <select v-model="filters.status" class="select">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="planned">Planned</option>
          </select>
          <i class="fas fa-chevron-down form__select-icon"></i>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isSearching" class="box">
      <div class="search-loading">
        <div class="spinner"></div>
        <p>Searching projects...</p>
      </div>
    </div>

    <!-- No results state -->
    <div v-else-if="sortedAndFilteredProjects.length === 0 && hasActiveFilters" class="box">
      <div class="no-results">
        <i class="fas fa-folder-open"></i>
        <p>No projects found</p>
        <span>Try adjusting your search criteria</span>
        <button class="button button--secondary box-small" @click="clearFilters">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Projects table -->
    <div v-else class="box2">
      <table class="table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :style="{ width: column.width + 'px', minWidth: column.minWidth + 'px' }"
            >
              <div class="th-content">
                <span 
                  @click="column.sortable ? sortBy(column.key) : null"
                  :class="{ 'pointer': column.sortable }"
                  class="text bold flex middle-xs gap"
                >
                  {{ column.label }}
                  <i 
                    v-if="column.sortable && sortColumn === column.key"
                    :class="sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"
                  ></i>
                  <i v-else-if="column.sortable" class="fas fa-sort gray"></i>
                </span>
                
                <div 
                  v-if="column.resizable"
                  class="column-resizer"
                  @mousedown="startResize($event, column)"
                ></div>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody>
          <tr 
            v-for="project in sortedAndFilteredProjects" 
            :key="project.id"
            @click="$emit('project-click', project.id)"
            class="pointer"
          >
            <td>
              <span class="text gray">#{{ project.id }}</span>
            </td>
            <td class="center">
              <div class="text bold black">{{ project.name }}</div>
              <div v-if="project.shortDescription" class="text gray box-small">
                {{ project.shortDescription }}
              </div>
            </td>
            <td>
              <span class="text">
                <i class="fas fa-tasks gray"></i>
                {{ taskCounts[project.id] || 0 }}
              </span>
            </td>
            <td>
              <span :class="['status', `status--${project.status}`]">
                {{ capitalizeStatus(project.status) }}
              </span>
            </td>
            <td>
              <span class="text gray">
                {{ formatDate(project.createdAt) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Results count -->
    <div v-if="sortedAndFilteredProjects.length > 0" class="box">
      <div class="text gray" style="text-align: center;">
        Showing {{ sortedAndFilteredProjects.length }} of {{ projects.length }} projects
      </div>
    </div>

    <!-- Create project modal -->
    <ProjectFormModal
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @submit="handleCreateProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Project } from '@/types/project.types';
import ProjectFormModal from './ProjectFormModal.vue';

const props = defineProps<{
  projects: Project[];
  taskCounts: Record<number, number>;
}>();

const emit = defineEmits<{
  'project-click': [id: number];
  'create-project': [data: { name: string; shortDescription?: string }];
}>();

const isModalOpen = ref(false);

const columns = ref([
  { key: 'id', label: 'ID', sortable: true, width: 80, minWidth: 60, resizable: false },
  { key: 'name', label: 'Project Name', sortable: true, width: 350, minWidth: 200, resizable: true },
  { key: 'taskCount', label: 'Tasks', sortable: true, width: 120, minWidth: 80, resizable: true },
  { key: 'status', label: 'Status', sortable: true, width: 150, minWidth: 100, resizable: true },
  { key: 'createdAt', label: 'Created', sortable: true, width: 150, minWidth: 120, resizable: true }
]);

// Load saved filters and sort from localStorage
const savedFilters = localStorage.getItem('projects-filters');
const savedSort = localStorage.getItem('projects-sort');

const sortColumn = ref(savedSort ? JSON.parse(savedSort).column : 'createdAt');
const sortDirection = ref<'asc' | 'desc'>(savedSort ? JSON.parse(savedSort).direction : 'desc');
const searchInput = ref('');
const isSearching = ref(false);
const filters = ref(savedFilters ? JSON.parse(savedFilters) : { name: '', status: '' });

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Check if any filters are active
 */
const hasActiveFilters = computed(() => {
  return Boolean(filters.value.name || filters.value.status);
});

/**
 * Watch search input with debounce
 */
watch(searchInput, (value) => {
  // Clear previous timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  // Reset loading state
  isSearching.value = false;
  
  if (value.trim()) {
    // Start search after user stops typing for 3 seconds
    debounceTimer = setTimeout(() => {
      isSearching.value = true; // Show loading
      
      // Simulate search delay (remove this if you don't need it)
      setTimeout(() => {
        filters.value.name = value;
        isSearching.value = false; // Hide loading
      }, 300); // Short delay to show loading indicator
      
    }, 500); // 3 seconds after user stops typing
  } else {
    // Clear filters immediately if input is empty
    filters.value.name = '';
  }
});
/**
 * Save filters to localStorage when changed
 */
watch(filters, (value) => {
  localStorage.setItem('projects-filters', JSON.stringify(value));
}, { deep: true });

/**
 * Save sort settings to localStorage when changed
 */
watch([sortColumn, sortDirection], ([column, direction]) => {
  localStorage.setItem('projects-sort', JSON.stringify({ column, direction }));
});

/**
 * Sort table by column
 */
function sortBy(column: string) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

/**
 * Clear search input
 */
function clearSearch() {
  searchInput.value = '';
}

/**
 * Clear all filters
 */
function clearFilters() {
  searchInput.value = '';
  filters.value.status = '';
}

/**
 * Handle project creation with notification
 */
function handleCreateProject(data: { name: string; shortDescription?: string }) {
  emit('create-project', data);
  isModalOpen.value = false;
}

/**
 * Capitalize status string
 */
function capitalizeStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Format date to readable string
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get sortable value for a project
 */
function getSortValue(project: Project, column: string): any {
  switch (column) {
    case 'id':
      return project.id;
    case 'name':
      return project.name.toLowerCase();
    case 'taskCount':
      return props.taskCounts[project.id] || 0;
    case 'status':
      return project.status;
    case 'createdAt':
      return new Date(project.createdAt).getTime();
    default:
      return '';
  }
}

/**
 * Compute sorted and filtered projects
 */
const sortedAndFilteredProjects = computed(() => {
  let result = [...props.projects];

  // Apply filters
  if (filters.value.name) {
    const searchTerm = filters.value.name.toLowerCase();
    result = result.filter(project => 
      project.name.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.value.status) {
    result = result.filter(project => project.status === filters.value.status);
  }

  // Apply sorting
  result.sort((firstProject, secondProject) => {
    const firstValue = getSortValue(firstProject, sortColumn.value);
    const secondValue = getSortValue(secondProject, sortColumn.value);

    if (firstValue < secondValue) {
      return sortDirection.value === 'asc' ? -1 : 1;
    }
    if (firstValue > secondValue) {
      return sortDirection.value === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return result;
});

// Column resizing
let resizingColumn: any = null;
let startPositionX = 0;
let startWidth = 0;

/**
 * Start column resize operation
 */
function startResize(event: MouseEvent, column: any) {
  resizingColumn = column;
  startPositionX = event.pageX;
  startWidth = column.width;
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Handle column resize during mouse move
 */
function handleResize(event: MouseEvent) {
  if (resizingColumn) {
    const deltaX = event.pageX - startPositionX;
    resizingColumn.width = Math.max(resizingColumn.minWidth, startWidth + deltaX);
  }
}

/**
 * Stop column resize operation
 */
function stopResize() {
  resizingColumn = null;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}
</script>