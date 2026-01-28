<template>
  <div>
    <router-view />
    <Notification />
  </div>
</template>

<script setup lang="ts">
import Notification from '@/components/common/Notification.vue';
</script>

<style lang="scss">
@use './styles/main.scss';
</style>
