<script lang="ts" setup>
import { useTileTemplates } from '@/composables/useTileTemplates'
import { useTextEditor } from '@/composables/useTextEditor'
import { usePdfGenerator } from '@/composables/usePdfGenerator'
import * as pdfjsLib from 'pdfjs-dist'

import TileTemplateSelector from './TileTemplateSelector.vue'
import TextEditorSection from './TextEditorSection.vue'
import PreviewSection from './PreviewSection.vue'

// Composables
const { tileOptions, selectedTileId, selectedTemplate, selectTemplate } = useTileTemplates()
const {
  editorRef,
  isUpdatingFromEditor,
  updateEditorFromValue,
  toggleBold,
  handleEditorInput,
  handleEditorKeydown,
  getCharacterCount,
  getLineCount
} = useTextEditor()
const { isLoading: pdfLoading, createModifiedPdf, generateFinalPdf, loadOriginalPdf } = usePdfGenerator()
// Reactive state
const value = ref(selectedTemplate.value.text)
const isLoading = ref(false)

// Template selection
function handleSelectTemplate(templateId: number) {
  selectTemplate(templateId)
  value.value = selectedTemplate.value.text
  updateEditorFromValue(value.value)
}

// Text editor handlers
function handleToggleBold() {
  toggleBold(value)
}

function handleEditorInputEvent() {
  handleEditorInput(value)
}

function handleEditorKeydownEvent(event: KeyboardEvent) {
  handleEditorKeydown(event, value)
}

// PDF generation
async function handleGeneratePdf() {
  await generateFinalPdf(value.value)
  // Refresh the preview after PDF generation
  await nextTick()
  await updatePdf()
}

// PDF display function
async function displayPdf(pdfBytes: Uint8Array) {
  const container = previewSectionRef.value?.containerRef
  const canvas = previewSectionRef.value?.canvasRef

  if (!container || !canvas) {
    // Retry after a short delay
    setTimeout(() => displayPdf(pdfBytes), 50)
    return
  }

  try {
    // Loading document from bytes
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBytes,
      enableXfa: true,
    })

    const pdfDocument = await loadingTask.promise
    const page = await pdfDocument.getPage(1)

    // Get container dimensions for responsive scaling
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width || 400
    const containerHeight = containerRect.height || 400

    // Get page dimensions
    const viewport = page.getViewport({ scale: 1 })
    const pageWidth = viewport.width
    const pageHeight = viewport.height

    // Calculate scale to fit container while maintaining aspect ratio
    const scaleX = containerWidth / pageWidth
    const scaleY = containerHeight / pageHeight
    const scale = Math.min(scaleX, scaleY, 2) // Cap at 2x for performance

    // Set canvas size based on scaled dimensions
    const scaledViewport = page.getViewport({ scale })
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height

    // Style the canvas to be responsive
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
    canvas.style.maxWidth = `${scaledViewport.width}px`
    canvas.style.maxHeight = `${scaledViewport.height}px`

    // Render the page
    const context = canvas.getContext('2d')!
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    }

    await page.render(renderContext).promise
  } catch (error) {
    console.error('Error displaying PDF:', error)
  }
}

// PDF preview update
async function updatePdf() {
  if (!value.value) return

  isLoading.value = true
  try {
    const modifiedPdfBytes = await createModifiedPdf(value.value)
    await displayPdf(modifiedPdfBytes)
  } catch (error) {
    console.error('Error updating PDF:', error)
  } finally {
    isLoading.value = false
  }
}

// Debounced PDF update
let debounceTimer: ReturnType<typeof setTimeout> | undefined
const debouncedUpdatePdf = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    await updatePdf()
  }, 500)
}

// Computed properties
const characterCount = computed(() => getCharacterCount(value.value))
const lineCount = computed(() => getLineCount(value.value))

// Watchers
watch(value, debouncedUpdatePdf)

watch(value, () => {
  if (!isUpdatingFromEditor.value) {
    updateEditorFromValue(value.value)
  }
})

// Text editor section ref
const textEditorRef = ref<InstanceType<typeof TextEditorSection> | null>(null)
const previewSectionRef = ref<InstanceType<typeof PreviewSection> | null>(null)

// Sync editor refs
watchEffect(() => {
  if (textEditorRef.value?.editorRef) {
    editorRef.value = textEditorRef.value.editorRef
  }
})

// Initialization
onMounted(async () => {
  await loadOriginalPdf()
  await nextTick()
  updateEditorFromValue(value.value)
  await updatePdf()

  // Add resize handler for responsive behavior
  const handleResize = () => debouncedUpdatePdf()
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Template Selector -->
    <TileTemplateSelector
      :templates="tileOptions"
      :selected-template-id="selectedTileId"
      @select-template="handleSelectTemplate"
    />

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Text Input Section -->
      <TextEditorSection
        ref="textEditorRef"
        v-model="value"
        :character-count="characterCount"
        :line-count="lineCount"
        :is-loading="pdfLoading"
        @toggle-bold="handleToggleBold"
        @editor-input="handleEditorInputEvent"
        @editor-keydown="handleEditorKeydownEvent"
        @generate-pdf="handleGeneratePdf"
      />

      <!-- Preview Section -->
      <PreviewSection
        ref="previewSectionRef"
        :is-loading="isLoading"
      />
    </div>
  </div>
</template>
