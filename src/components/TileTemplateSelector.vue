<script lang="ts" setup>
import TileTemplateCard from './TileTemplateCard.vue'
import type { TileTemplate } from '@/composables/useTileTemplates'

interface Props {
  templates: TileTemplate[]
  selectedTemplateId: number
}

interface Emits {
  (e: 'select-template', templateId: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSelectTemplate(templateId: number) {
  emit('select-template', templateId)
}
</script>

<template>
  <div class="flex gap-3 mb-6">
    <TileTemplateCard
      v-for="template in templates"
      :key="template.id"
      :template="template"
      :is-selected="template.id === selectedTemplateId"
      @select="handleSelectTemplate"
    />
  </div>
</template>
