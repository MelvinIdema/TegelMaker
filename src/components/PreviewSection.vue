<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import LoadingPreview from './LoadingPreview.vue'
import PreviewCanvas from './PreviewCanvas.vue'

interface Props {
  isLoading: boolean
}

defineProps<Props>()

const previewCanvasRef = ref<InstanceType<typeof PreviewCanvas> | null>(null)
const containerRef = computed(() => previewCanvasRef.value?.containerRef)
const canvasRef = computed(() => previewCanvasRef.value?.canvasRef)

defineExpose({
  containerRef,
  canvasRef
})
</script>

<template>
  <Card class="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
    <CardHeader>
      <CardTitle class="text-2xl font-semibold flex items-center space-x-2">
        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Live Voorbeeld</span>
      </CardTitle>
      <CardDescription>
        Je tegel wordt automatisch bijgewerkt terwijl je typt
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg -m-2"></div>
        <div class="relative bg-white rounded-lg p-4 shadow-inner border-2 border-blue-100">
          <LoadingPreview v-if="isLoading" />
          <PreviewCanvas v-else ref="previewCanvasRef" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
