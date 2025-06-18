<script lang="ts" setup>
const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

defineExpose({
  containerRef,
  canvasRef
})
</script>

<template>
  <div
    ref="containerRef"
    class="flex items-center justify-center overflow-hidden rounded-lg w-full aspect-square mx-auto transition-all duration-300 hover:shadow-lg"
  >
    <canvas
      ref="canvasRef"
      class="max-w-full max-h-full object-contain rounded-lg shadow-sm canvas-preview"
    />
  </div>
</template>

<style scoped>
/* PDF canvas styling */
.canvas-preview {
  filter: drop-shadow(0 4px 6px -1px rgba(0, 0, 0, 0.1));
  border-radius: 8px;
}
</style>
