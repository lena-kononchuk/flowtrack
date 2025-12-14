<template>
  <div>
    <!-- Filters and Add button -->
    <div class="row box2">
      <div class="col-xs-12 col-sm-4 col-md-4">
        <div class="relative">
          <select v-model="filters.assignee" class="select">
            <option value="">All Assignees</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            <option value="Mike Johnson">Mike Johnson</option>
            <option value="Sarah Williams">Sarah Williams</option>
          </select>
          <i class="fas fa-chevron-down form__select-icon"></i>
        </div>
      </div>
      
      <div class="col-xs-12 col-sm-4 col-md-4">
        <div class="relative">
          <select v-model="filters.status" class="select">
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <i class="fas fa-chevron-down form__select-icon"></i>
        </div>
      </div>

      <div class="col-xs-12 col-sm-4 col-md-4">
        <button class="button button--primary button__full" @click="$emit('add-task')">
          <i class="fas fa-plus"></i>
          Add Task
        </button>
      </div>
    </div>

    <!-- Tasks table -->
    <div class="box2">
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
                  <i 
                    v-else-if="column.sortable"
                    class="fas fa-sort gray"
                  ></i>
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
        
        <draggable
          v-model="sortedAndFilteredTasks"
          tag="tbody"
          item-key="id"
          handle=".drag-handle"
        >
          <template #item="{ element: task }">
            <tr>
              <td>
                <i class="fas fa-grip-vertical drag-handle gray"></i>
              </td>
              <td>
                <span class="text gray">#{{ task.id }}</span>
              </td>
              <td @click="$emit('edit-task', task)" class="pointer">
                <div class="text bold black">{{ task.name }}</div>
              </td>
              <td>
                <span class="text">{{ task.assignee || '—' }}</span>
              </td>
              <td>
                <span :class="['status', `status--${statusClass[task.status]}`]">
                  {{ statusLabel[task.status] }}
                </span>
              </td>
              <td>
                <span class="text gray">
                  {{ new Date(task.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
                </span>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
    </div>

    <!-- Results count -->
    <div v-if="sortedAndFilteredTasks.length > 0" class="box">
      <div class="text gray" style="text-align: center;">
        Showing {{ sortedAndFilteredTasks.length }} of {{ tasks.length }} tasks
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import draggable from 'vuedraggable';
import type { Task } from '@/types/task.types';

const props = defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  'edit-task': [task: Task];
  'add-task': [];
  'update-task-order': [tasks: Task[]];
}>();

/**
 * Table columns configuration
 */
const columns = ref([
  { key: 'drag', label: '', sortable: false, width: 40, minWidth: 40, resizable: false },
  { key: 'id', label: 'ID', sortable: true, width: 80, minWidth: 60, resizable: false },
  { key: 'name', label: 'Task Name', sortable: true, width: 300, minWidth: 200, resizable: true },
  { key: 'assignee', label: 'Assignee', sortable: true, width: 150, minWidth: 100, resizable: true },
  { key: 'status', label: 'Status', sortable: true, width: 150, minWidth: 100, resizable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true, width: 150, minWidth: 120, resizable: true }
]);

// Load saved filters and sort from localStorage
const savedFilters = localStorage.getItem('tasks-filters');
const savedSort = localStorage.getItem('tasks-sort');

const sortColumn = ref(savedSort ? JSON.parse(savedSort).column : 'order');
const sortDirection = ref<'asc' | 'desc'>(savedSort ? JSON.parse(savedSort).direction : 'asc');
const filters = ref(savedFilters ? JSON.parse(savedFilters) : { assignee: '', status: '' });

/**
 * Map task status to display labels
 */
const statusLabel: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done'
};

/**
 * Map task status to CSS class names
 */
const statusClass: Record<string, string> = {
  'todo': 'planned',
  'in-progress': 'pending',
  'done': 'completed'
};

/**
 * Save filters to localStorage when changed
 */
watch(filters, (value) => {
  localStorage.setItem('tasks-filters', JSON.stringify(value));
}, { deep: true });

/**
 * Save sort settings to localStorage when changed
 */
watch([sortColumn, sortDirection], ([column, direction]) => {
  localStorage.setItem('tasks-sort', JSON.stringify({ column, direction }));
});

/**
 * Sort table by specified column
 * @param column - Column key to sort by
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
 * Computed property for sorted and filtered tasks
 * Returns tasks array filtered by assignee and status, then sorted
 */
const sortedAndFilteredTasks = computed({
  get() {
    let result = [...props.tasks];

    // Apply filters
    if (filters.value.assignee) {
      result = result.filter(task => task.assignee === filters.value.assignee);
    }
    if (filters.value.status) {
      result = result.filter(task => task.status === filters.value.status);
    }

    // Apply sorting
    result.sort((firstTask, secondTask) => {
      let firstValue: any, secondValue: any;

      if (sortColumn.value === 'id') {
        firstValue = firstTask.id;
        secondValue = secondTask.id;
      } else if (sortColumn.value === 'name') {
        firstValue = firstTask.name.toLowerCase();
        secondValue = secondTask.name.toLowerCase();
      } else if (sortColumn.value === 'assignee') {
        firstValue = (firstTask.assignee || '').toLowerCase();
        secondValue = (secondTask.assignee || '').toLowerCase();
      } else if (sortColumn.value === 'status') {
        firstValue = firstTask.status;
        secondValue = secondTask.status;
      } else if (sortColumn.value === 'dueDate') {
        firstValue = new Date(firstTask.dueDate).getTime();
        secondValue = new Date(secondTask.dueDate).getTime();
      } else {
        firstValue = firstTask.order;
        secondValue = secondTask.order;
      }

      if (firstValue < secondValue) return sortDirection.value === 'asc' ? -1 : 1;
      if (firstValue > secondValue) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  },
  set(value) {
    emit('update-task-order', value);
  }
});

// Column resizing variables
let resizingColumn: any = null;
let startPositionX = 0;
let startWidth = 0;

/**
 * Start column resize operation
 * @param event - Mouse event
 * @param column - Column being resized
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
 * @param event - Mouse event
 */
function handleResize(event: MouseEvent) {
  if (resizingColumn) {
    resizingColumn.width = Math.max(resizingColumn.minWidth, startWidth + (event.pageX - startPositionX));
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

<style scoped>
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>