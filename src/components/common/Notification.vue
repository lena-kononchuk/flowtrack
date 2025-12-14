<template>
  <Teleport to="body">
    <div class="notifications">
      <TransitionGroup name="notification">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification', `notification--${notification.type}`]"
          @click="remove(notification.id)"
        >
          <i :class="getIcon(notification.type)"></i>
          <span>{{ notification.message }}</span>
          <button class="notification__close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { UseNotifications, type NotificationType } from '@/composables/UseNotifications';

const { notifications, remove } = UseNotifications();

/**
 * Get icon class based on notification type
 */
const getIcon = (type: NotificationType): string => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  return icons[type];
};
</script>

