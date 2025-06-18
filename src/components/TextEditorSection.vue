<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

import CharacterCounter from './CharacterCounter.vue'
import FormattingToolbar from './FormattingToolbar.vue'
import WysiwygEditor from './WysiwygEditor.vue'
import InstructionCard from './InstructionCard.vue'
import GeneratePdfButton from './GeneratePdfButton.vue'

interface Props {
  modelValue: string
  characterCount: number
  lineCount: number
  isLoading: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'toggle-bold'): void
  (e: 'editor-input'): void
  (e: 'editor-keydown', event: KeyboardEvent): void
  (e: 'generate-pdf'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const editorRef = ref<InstanceType<typeof WysiwygEditor> | null>(null)

function handleToggleBold() {
  emit('toggle-bold')
}

function handleEditorInput() {
  emit('editor-input')
}

function handleEditorKeydown(event: KeyboardEvent) {
  emit('editor-keydown', event)
}

function handleGeneratePdf() {
  emit('generate-pdf')
}

defineExpose({
  editorRef: computed(() => editorRef.value?.editorRef)
})
</script>

<template>
  <Card class="h-fit shadow-xl border-0 bg-card/50 backdrop-blur-sm">
    <CardHeader class="space-y-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-2xl font-semibold flex items-center space-x-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Ontwerp Je Tegel</span>
        </CardTitle>
        <CharacterCounter :character-count="characterCount" :line-count="lineCount" />
      </div>
      <CardDescription class="text-base">
        Voer hieronder je aangepaste tekst in. Gebruik de opmaakwerkbalk om tekst vet te maken.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="space-y-3">
        <Label for="tile-text" class="text-sm font-medium flex items-center space-x-2">
          <span>Tegel Tekst</span>
          <Tooltip>
            <TooltipTrigger>
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-xs">Gebruik Enter voor regelafbreking<br/>Desktop: Selecteer tekst en klik Vet of gebruik Ctrl+B<br/>Mobile: Selecteer tekst voor contextmenu</p>
            </TooltipContent>
          </Tooltip>
        </Label>

        <FormattingToolbar @toggle-bold="handleToggleBold" />

        <WysiwygEditor
          ref="editorRef"
          :model-value="modelValue"
          @input="handleEditorInput"
          @keydown="handleEditorKeydown"
        />
      </div>

      <Separator />

      <InstructionCard />

      <Separator />

      <GeneratePdfButton
        :is-loading="isLoading"
        :is-disabled="!modelValue.trim()"
        @generate="handleGeneratePdf"
      />
    </CardContent>
  </Card>
</template>
