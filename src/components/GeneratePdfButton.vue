<script lang="ts" setup>
import { Button } from '@/components/ui/button'

interface Props {
  isLoading: boolean
  isDisabled: boolean
}

interface Emits {
  (e: 'generate'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleGenerate() {
  emit('generate')
}
</script>

<template>
  <div class="flex flex-col space-y-3">
    <Button
      @click="handleGenerate"
      :disabled="isLoading || isDisabled"
      size="lg"
      class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <svg v-if="!isLoading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <svg v-else class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {{ isLoading ? 'PDF Genereren...' : 'Genereer Printbare PDF' }}
    </Button>
    <p class="text-xs text-muted-foreground text-center">
      Maakt een A4 liggend PDF bestand met twee tegels klaar om te printen op stickerpapier
    </p>
  </div>
</template>
