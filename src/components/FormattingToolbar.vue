<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Emits {
  (e: 'toggle-bold'): void
}

const emit = defineEmits<Emits>()

// Check if device is mobile
const isMobile = ref(false)

onMounted(() => {
  // Simple mobile detection
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth <= 768 ||
                   ('ontouchstart' in window)
})

function handleToggleBold() {
  emit('toggle-bold')
}
</script>

<template>
  <!-- Only show on desktop/non-mobile devices -->
  <div
    v-if="!isMobile"
    class="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg border"
  >
    <Button
      @click="handleToggleBold"
      variant="ghost"
      size="sm"
      class="h-8 px-2 font-bold hover:bg-background"
      title="Vet (Ctrl+B)"
    >
      Vet
    </Button>
    <Separator orientation="vertical" class="h-6" />
    <span class="text-xs text-muted-foreground">Selecteer tekst en klik Vet of gebruik Ctrl+B</span>
  </div>

  <!-- Mobile instruction -->
  <div
    v-else
    class="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
  >
    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span class="text-xs text-blue-700">Selecteer tekst om opmaakwerkbalk te tonen</span>
  </div>
</template>
