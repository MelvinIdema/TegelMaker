<script lang="ts" setup>
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-96 space-y-4">
    <div class="space-y-3 w-full max-w-sm">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-3/4" />
      <Skeleton class="h-4 w-1/2" />
    </div>
    <div class="flex items-center space-x-2 text-sm text-muted-foreground">
      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Voorbeeld bijwerken...</span>
    </div>
  </div>
</template>
