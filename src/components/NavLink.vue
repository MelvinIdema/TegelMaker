<script setup lang="ts">
interface Props {
  to: string
}

defineProps<Props>()
</script>

<template>
  <RouterLink
    :to="to"
    class="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
  >
    <slot />
    <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
  </RouterLink>
</template>

<style scoped>
@reference '@/assets/main.css';

/* Custom router-link active styles */
:deep(.router-link-active) {
  @apply text-foreground;
}

:deep(.router-link-active span) {
  @apply w-full;
}
</style>
