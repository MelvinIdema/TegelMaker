<script lang="ts" setup>
import { Badge } from '@/components/ui/badge'

interface Props {
  characterCount: number
  lineCount: number
}

defineProps<Props>()
</script>

<template>
  <div class="flex items-center space-x-2 text-sm text-muted-foreground">
    <Badge variant="outline" class="text-xs">
      {{ lineCount }} {{ lineCount === 1 ? 'regel' : 'regels' }}
    </Badge>
    <Badge variant="outline" class="text-xs">
      {{ characterCount }} tekens
    </Badge>
  </div>
</template>
