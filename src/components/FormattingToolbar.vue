<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Emits {
  (e: 'toggle-bold'): void
}

const emit = defineEmits<Emits>()

function handleToggleBold() {
  emit('toggle-bold')
}
</script>

<template>
  <div class="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg border">
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
</template>
