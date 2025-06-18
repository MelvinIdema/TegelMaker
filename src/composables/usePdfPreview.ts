import * as pdfjsLib from 'pdfjs-dist'

export function usePdfPreview() {
  const containerRef = ref<HTMLDivElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  // Function to display PDF using simple canvas rendering
  async function displayPdf(pdfBytes: Uint8Array) {
    const container = containerRef.value
    const canvas = canvasRef.value

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

  return {
    containerRef,
    canvasRef,
    displayPdf,
  }
}
