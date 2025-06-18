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

function handleInput() {
  emit('input')
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}

defineExpose({
  editorRef
})
</script>

<template>
  <div
    ref="editorRef"
    contenteditable="true"
    class="min-h-[200px] p-3 text-base bg-background/50 border-2 border-border/50 focus:border-blue-400 focus:outline-none transition-colors resize-none rounded-md overflow-y-auto wysiwyg-editor"
    @input="handleInput"
    @keydown="handleKeydown"
    :placeholder="placeholder"
  ></div>
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
</style>
