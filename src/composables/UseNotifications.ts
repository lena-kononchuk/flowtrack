import { ref } from 'vue';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Notification interface
export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

// Notification timeout in milliseconds
const NOTIFICATION_TIMEOUT = 5000;

// Global notifications array (reactive)
const notifications = ref<Notification[]>([]);

// Counter for unique notification IDs
let notificationId = 0;

/**
 * Add a new notification
 * @param type - Notification type (success, error, warning, info)
 * @param message - Notification message
 */
const addNotification = (type: NotificationType, message: string) => {
  const id = ++notificationId;
  
  notifications.value.push({ id, type, message });
  
  // Auto-remove notification after timeout
  setTimeout(() => {
    removeNotification(id);
  }, NOTIFICATION_TIMEOUT);
};

/**
 * Remove notification by ID
 * @param id - Notification ID to remove
 */
const removeNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

/**
 * Composable for notifications
 */
export const UseNotifications = () => {
  return {
    notifications,
    success: (message: string) => addNotification('success', message),
    error: (message: string) => addNotification('error', message),
    warning: (message: string) => addNotification('warning', message),
    info: (message: string) => addNotification('info', message),
    remove: removeNotification
  };
};