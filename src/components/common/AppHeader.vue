<template>
  <header class="header">
    <div class="wrapper">
      <div class="flex middle-xs between-xs">
          <div class="header__logo">
            <span class="header__logo-text">FlowTrack</span>
          </div>
        
          <div class="header__user">
           <div  class="header__user-avatar"></div>
            <span class="header__user-name">{{ userName }}</span>
          </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const userName = ref("Anna"); 
</script>
