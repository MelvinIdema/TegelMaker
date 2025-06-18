<script lang="ts" setup>
import TileDesigner from '@/components/TileDesigner.vue'
</script>

<template>
  <TileDesigner />
</template>

<style scoped>
@reference "../assets/main.css";

/* Custom scrollbar for textarea */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-muted rounded-lg;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-border rounded-lg hover:bg-border/80;
}

/* Animation for loading state */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px);
  background-size: 200px;
}
</style>
