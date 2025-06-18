<script lang="ts" setup>
import type { TileTemplate } from '@/composables/useTileTemplates'

interface Props {
  template: TileTemplate
  isSelected: boolean
}

interface Emits {
  (e: 'select', templateId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSelect() {
  emit('select', props.template.id)
}
</script>

<template>
  <div
    @click="handleSelect"
    :class="[
      'group cursor-pointer rounded-md overflow-hidden transition-all duration-200 hover:shadow-md aspect-square h-46',
      isSelected
        ? 'ring-2 ring-blue-500 shadow-sm bg-blue-50/50'
        : 'shadow-sm hover:shadow-sm bg-background/50 border border-border/50'
    ]"
  >
    <!-- Thumbnail content -->
    <div class="relative w-full h-full bg-gradient-to-br from-muted/20 to-muted/40">
      <!-- Preview text content -->
      <div class="absolute inset-0 flex items-center justify-center p-2">
        <p class="text-foreground/70 text-xs font-mono leading-tight text-center line-clamp-3">
          {{ template.preview }}
        </p>
      </div>

      <!-- Title bar -->
      <div class="absolute bottom-0 left-0 right-0 p-2 bg-background/90 backdrop-blur-sm border-t border-border/20">
        <div class="flex items-center justify-between">
          <h3 class="text-foreground text-xs font-medium truncate">{{ template.name }}</h3>

          <!-- Selection indicator -->
          <div
            v-if="isSelected"
            class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ml-1"
          >
            <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Hover effect overlay -->
      <div class="absolute inset-0 bg-blue-100/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  </div>
</template>
