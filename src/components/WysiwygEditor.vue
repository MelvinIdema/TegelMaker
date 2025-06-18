<script lang="ts" setup>
interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input'): void
  (e: 'keydown', event: KeyboardEvent): void
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Voer hier je tegeltekst in...'
})

const emit = defineEmits<Emits>()

const editorRef = ref<HTMLDivElement | null>(null)
const showFloatingToolbar = ref(false)
const toolbarPosition = ref({ top: 0, left: 0 })
const savedRange = ref<Range | null>(null)

// Check if device is mobile
const isMobile = ref(false)

onMounted(() => {
  // Simple mobile detection
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   window.innerWidth <= 768 ||
                   ('ontouchstart' in window)

  // Add global click listener to hide toolbar when clicking outside
  document.addEventListener('click', handleGlobalClick)
  document.addEventListener('selectionchange', handleSelectionChange)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  document.removeEventListener('selectionchange', handleSelectionChange)
})

function handleInput() {
  emit('input')
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}

function handleGlobalClick(event: Event) {
  // Hide toolbar if clicking outside editor and toolbar
  const target = event.target as HTMLElement
  if (!editorRef.value?.contains(target) && !target.closest('.floating-toolbar')) {
    showFloatingToolbar.value = false
  }
}

function handleSelectionChange() {
  if (!isMobile.value) return

  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !editorRef.value) {
    showFloatingToolbar.value = false
    return
  }

  // Check if selection is within our editor
  const range = selection.getRangeAt(0)
  if (!editorRef.value.contains(range.commonAncestorContainer)) {
    showFloatingToolbar.value = false
    return
  }

  // Save the range for later use
  savedRange.value = range.cloneRange()

    // Position the floating toolbar
  const rect = range.getBoundingClientRect()
  const editorRect = editorRef.value.getBoundingClientRect()

  // Calculate position with bounds checking
  let top = rect.top - editorRect.top - 60 // 60px above selection
  let left = rect.left - editorRect.left + (rect.width / 2) - 40 // Center on selection

  // Ensure toolbar stays within editor bounds
  const toolbarWidth = 80 // Approximate toolbar width
  if (left < 10) left = 10
  if (left + toolbarWidth > editorRect.width - 10) left = editorRect.width - toolbarWidth - 10
  if (top < 10) top = rect.bottom - editorRect.top + 10 // Show below if no space above

  toolbarPosition.value = { top, left }
  showFloatingToolbar.value = true
}

function restoreSelection() {
  if (savedRange.value && editorRef.value) {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(savedRange.value)
      editorRef.value.focus()
    }
  }
}

function handleFloatingBold() {
  // Restore selection first
  restoreSelection()

  // Apply bold formatting
  document.execCommand('bold', false)

  // Update parent component
  handleInput()

  // Hide toolbar after applying formatting
  showFloatingToolbar.value = false
}

defineExpose({
  editorRef
})
</script>

<template>
  <div class="relative">
    <div
      ref="editorRef"
      contenteditable="true"
      class="min-h-[200px] p-3 text-base bg-background/50 border-2 border-border/50 focus:border-blue-400 focus:outline-none transition-colors resize-none rounded-md overflow-y-auto wysiwyg-editor"
      @input="handleInput"
      @keydown="handleKeydown"
      :placeholder="placeholder"
    ></div>

        <!-- Floating Toolbar for Mobile -->
    <Transition name="fade-slide">
      <div
        v-if="showFloatingToolbar && isMobile"
        class="floating-toolbar absolute z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 px-2 py-1 flex items-center space-x-1"
        :style="{
          top: toolbarPosition.top + 'px',
          left: toolbarPosition.left + 'px'
        }"
      >
        <button
          @click="handleFloatingBold"
          class="px-3 py-2 text-sm font-bold bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          title="Maak vet"
        >
          <strong>B</strong>
        </button>

        <!-- Small arrow pointing down to selection -->
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* WYSIWYG Editor Styles */
.wysiwyg-editor {
  line-height: 1.6;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', monospace;
}

.wysiwyg-editor:empty:before {
  content: attr(placeholder);
  color: hsl(var(--muted-foreground));
  pointer-events: none;
}

.wysiwyg-editor strong,
.wysiwyg-editor b {
  font-weight: bold;
  color: hsl(var(--foreground));
}

.wysiwyg-editor:focus {
  outline: none;
}

/* Handle line breaks in contenteditable */
.wysiwyg-editor br {
  display: block;
  margin: 0;
}

.wysiwyg-editor div {
  margin: 0;
}

/* Floating toolbar styles */
.floating-toolbar {
  pointer-events: auto;
  user-select: none;
  -webkit-user-select: none;
}

/* Ensure toolbar is above other content */
.floating-toolbar {
  z-index: 1000;
}

/* Transition animations for floating toolbar */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

/* Mobile-specific touch improvements */
@media (max-width: 768px) {
  .wysiwyg-editor {
    /* Better touch scrolling */
    -webkit-overflow-scrolling: touch;
    /* Prevent zoom on focus */
    font-size: 16px;
  }

  .floating-toolbar button {
    /* Better touch targets */
    min-height: 48px;
    min-width: 48px;
  }
}
</style>
