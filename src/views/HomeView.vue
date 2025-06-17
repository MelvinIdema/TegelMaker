<script lang="ts" setup>
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { nextTick } from 'vue'
import { toast } from 'vue-sonner'

// Set the worker source to use the local npm package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

// Predefined tile options
const tileOptions = [
  {
    id: 1,
    name: "Verjaardag Tegel",
    text: `Ben ik verdorie\n<b>28</b>\ngeworden krijg ik\nzo'n achterlijk\n<b>kut tegeltje</b>`,
    preview: "Ben ik verdorie 28 geworden krijg ik zo'n achterlijk kut tegeltje"
  },
  {
    id: 2,
    name: "Voetbal Tegel",
    text: `Neuken?\nNee!\n<b>OSS</b> speelt`,
    preview: "Neuken? Nee! OSS speelt"
  },
  {
    id: 3,
    name: "Auto Tegel",
    text: `Neuken?\nNee!\nIk werk aan mijn\n<b>Dodge</b>`,
    preview: "Neuken? Nee! Ik werk aan mijn Dodge"
  }
]

// Initialize with first template selected
const selectedTileId = ref<number>(1)
const value = ref(tileOptions[0].text)

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(false)
const originalPdfBytes = ref<Uint8Array | null>(null)
const isUpdatingFromEditor = ref(false)

// Function to select a predefined tile
function selectTile(tile: typeof tileOptions[0]) {
  selectedTileId.value = tile.id
  value.value = tile.text
  updateEditorFromValue()
}

// WYSIWYG Editor functions
function convertToHtml(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function convertFromHtml(html: string): string {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div')
  temp.innerHTML = html

  // Replace <strong> and <b> tags with <b> tags
  temp.querySelectorAll('strong, b').forEach(el => {
    el.outerHTML = `<b>${el.textContent}</b>`
  })

  // Replace <br> tags with newlines and get text content
  let text = temp.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n')

  // Clean up extra newlines
  text = text.replace(/\n+/g, '\n').trim()

  return text
}

function updateValueFromEditor() {
  if (!editorRef.value) return
  const html = editorRef.value.innerHTML
  isUpdatingFromEditor.value = true
  value.value = convertFromHtml(html)
  nextTick(() => {
    isUpdatingFromEditor.value = false
  })
}

function updateEditorFromValue() {
  if (!editorRef.value) return
  const html = convertToHtml(value.value)
  if (editorRef.value.innerHTML !== html) {
    editorRef.value.innerHTML = html
  }
}

function toggleBold() {
  document.execCommand('bold', false)
  updateValueFromEditor()
}

function handleEditorInput() {
  updateValueFromEditor()
}

function handleEditorKeydown(event: KeyboardEvent) {
  // Handle Ctrl+B for bold
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    toggleBold()
  }
}

// Interface for text segments with different fonts
interface TextSegment {
  text: string
  font: PDFFont
  width: number
}

// Function to parse text and create segments with appropriate fonts
function parseTextSegments(text: string, parksideLight: PDFFont, parksideBold: PDFFont, helvetica: PDFFont, fontSize: number): TextSegment[] {
  const segments: TextSegment[] = []

  // Replace <b>...</b> with a special marker and track bold segments
  const boldRegex = /<b>(.*?)<\/b>/g
  let lastIndex = 0
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold segment
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      segments.push(...parseNormalText(beforeText, parksideLight, helvetica, fontSize))
    }

    // Add the bold segment
    const boldText = match[1]
    segments.push(...parseNormalText(boldText, parksideBold, helvetica, fontSize))

    lastIndex = boldRegex.lastIndex
  }

  // Add remaining text after the last bold segment
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    segments.push(...parseNormalText(remainingText, parksideLight, helvetica, fontSize))
  }

  return segments
}

// Function to parse normal text and handle special punctuation marks
function parseNormalText(text: string, parksideFont: PDFFont, helvetica: PDFFont, fontSize: number): TextSegment[] {
  const segments: TextSegment[] = []
  let currentText = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '!' || char === "'") {
      // Add accumulated text with Parkside font
      if (currentText) {
        segments.push({
          text: currentText,
          font: parksideFont,
          width: parksideFont.widthOfTextAtSize(currentText, fontSize)
        })
        currentText = ''
      }

      // Add left spacing for punctuation marks
      const leftSpacing = fontSize * 0.05 // 10% of font size as left spacing
      segments.push({
        text: ' ', // Invisible spacing character
        font: helvetica,
        width: leftSpacing
      })

      // Add punctuation mark with Helvetica
      segments.push({
        text: char,
        font: helvetica,
        width: helvetica.widthOfTextAtSize(char, fontSize)
      })
    } else {
      currentText += char
    }
  }

  // Add any remaining text
  if (currentText) {
    segments.push({
      text: currentText,
      font: parksideFont,
      width: parksideFont.widthOfTextAtSize(currentText, fontSize)
    })
  }

  return segments
}

// Function to create a modified PDF with new text
async function createModifiedPdf(text: string): Promise<Uint8Array> {
  if (!originalPdfBytes.value) {
    throw new Error('Original PDF not loaded')
  }

  // Load the original PDF
  const pdfDoc = await PDFDocument.load(originalPdfBytes.value)

  // Register fontkit for custom font support
  pdfDoc.registerFontkit(fontkit)

  // Get the first page
  const pages = pdfDoc.getPages()
  const firstPage = pages[0]

  // Get page dimensions
  const { width, height } = firstPage.getSize()

  // Load and embed fonts
  const parksideLightResponse = await fetch('/fonts/Fontspring-DEMO-parkside-light.otf')
  const parksideLightBytes = await parksideLightResponse.arrayBuffer()
  const parksideLight = await pdfDoc.embedFont(parksideLightBytes)

  const parksideBoldResponse = await fetch('/fonts/Fontspring-DEMO-parkside-bold.otf')
  const parksideBoldBytes = await parksideBoldResponse.arrayBuffer()
  const parksideBold = await pdfDoc.embedFont(parksideBoldBytes)

  const minionItalicResponse = await fetch('/fonts/Minion Pro Cond Italic.otf')
  const minionItalicBytes = await minionItalicResponse.arrayBuffer()
  const helvetica = await pdfDoc.embedFont(minionItalicBytes)

  // Calculate text position (center of the page)
  const fontSize = 48
  const textLines = text.split('\n')
  const lineHeight = 64
  // Calculate startY to center the text block vertically
  const startY = height / 2 + (textLines.length - 1.5) * lineHeight / 2

  // Add the new text line by line (overlaying on original PDF content)
  textLines.forEach((line, index) => {
    const y = startY - (index * lineHeight)

    // Parse the line for different formatting
    const segments = parseTextSegments(line, parksideLight, parksideBold, helvetica, fontSize)

    // Calculate total width to center the line
    const totalWidth = segments.reduce((sum, segment) => sum + segment.width, 0)
    let currentX = (width - totalWidth) / 2 - 3

    // Draw each segment with its appropriate font
    segments.forEach(segment => {
      firstPage.drawText(segment.text, {
        x: currentX,
        y,
        size: fontSize,
        font: segment.font,
        color: rgb(0, 0, 0),
      })
      currentX += segment.width
    })
  })

  // Serialize the PDF
  return await pdfDoc.save()
}

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
      viewport: scaledViewport
    }

    await page.render(renderContext).promise
  } catch (error) {
    console.error('Error displaying PDF:', error)
  }
}

// Function to update the PDF with new text
async function updatePdf() {
  if (!originalPdfBytes.value) return

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

// Load the original PDF on mount
onMounted(async () => {
  try {
    // Load the original PDF file
    const response = await fetch('/solo-tegel-verdorie.pdf')
    originalPdfBytes.value = new Uint8Array(await response.arrayBuffer())

    // Wait for DOM to update so containerRef is set
    await nextTick()

    // Initialize editor with current value
    updateEditorFromValue()

    await updatePdf()

    // Add resize handler for responsive behavior
    const handleResize = () => debouncedUpdatePdf()
    window.addEventListener('resize', handleResize)

    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  } catch (error) {
    console.error('Error loading original PDF:', error)
  }
})

// Create a debounced version of updatePdf
let debounceTimer: ReturnType<typeof setTimeout> | undefined
const debouncedUpdatePdf = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    await updatePdf()
  }, 500)
}

// Function to convert PDF to image
async function pdfToImage(pdfBytes: Uint8Array, scale: number = 3): Promise<Uint8Array> {
  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes })
  const pdfDocument = await loadingTask.promise

  // Get the first page
  const page = await pdfDocument.getPage(1)

  // Get viewport with the specified scale for better quality
  const viewport = page.getViewport({ scale })

  // Create canvas
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = viewport.width
  canvas.height = viewport.height

  // Render the page to canvas
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  }

  await page.render(renderContext).promise

  // Convert canvas to PNG blob
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (blob) {
        const arrayBuffer = await blob.arrayBuffer()
        resolve(new Uint8Array(arrayBuffer))
      }
    }, 'image/png', 1.0)
  })
}

// Function to generate final A4 landscape PDF with duplicated content
async function generateFinalPdf() {
  if (!originalPdfBytes.value) return

  isLoading.value = true
  try {
    // Create the modified PDF first
    const modifiedPdfBytes = await createModifiedPdf(value.value)

    // Convert PDF to high-quality image
    const imageBytes = await pdfToImage(modifiedPdfBytes) // Use default high quality scale

    // Create a new A4 landscape PDF document
    const finalPdfDoc = await PDFDocument.create()
    finalPdfDoc.registerFontkit(fontkit)

    // Embed the image
    const embeddedImage = await finalPdfDoc.embedPng(imageBytes)

    // A4 landscape dimensions (842 x 595 points)
    const a4LandscapeWidth = 842
    const a4LandscapeHeight = 595
    const page = finalPdfDoc.addPage([a4LandscapeWidth, a4LandscapeHeight])

    // Get image dimensions
    const imageWidth = embeddedImage.width
    const imageHeight = embeddedImage.height

    // Calculate scaling to fit the original size on half of A4 landscape
    const targetWidth = a4LandscapeWidth / 2 // Exactly half the page width
    const targetHeight = a4LandscapeHeight // Full page height

    // Calculate scale to maintain aspect ratio
    const scaleX = targetWidth / imageWidth
    const scaleY = targetHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)

    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale

    // Calculate positions for perfect fit in each half
    const leftX = (a4LandscapeWidth / 4) - (scaledWidth / 2) // Center on left half
    const rightX = (3 * a4LandscapeWidth / 4) - (scaledWidth / 2) // Center on right half
    const y = a4LandscapeHeight - scaledHeight // Align at top with no margin

    // Draw the image on the left side
    page.drawImage(embeddedImage, {
      x: leftX,
      y: y,
      width: scaledWidth,
      height: scaledHeight,
    })

    // Draw the image on the right side (copy)
    page.drawImage(embeddedImage, {
      x: rightX,
      y: y,
      width: scaledWidth,
      height: scaledHeight,
    })

    // Generate the final PDF
    const finalPdfBytes = await finalPdfDoc.save()

    // Create a blob and download automatically
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    // Create a temporary download link and trigger download
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = 'mijn-tegel.pdf'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // Show success toast
    toast.success('Je tegel wordt gedownload!', {
      description: 'Het PDF-bestand wordt naar je downloads map gedownload.'
    })

    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000)

  } catch (error) {
    console.error('Error generating final PDF:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in the textarea and update the PDF
watch(value, debouncedUpdatePdf)

// Character count computed property
const characterCount = computed(() => {
  // Count characters in the plain text version (without HTML tags)
  return value.value.replace(/<b>(.*?)<\/b>/g, '$1').length
})
const lineCount = computed(() => value.value.split('\n').length)

// Watch for changes in value and update editor (only when not updating from editor)
watch(value, () => {
  if (!isUpdatingFromEditor.value) {
    updateEditorFromValue()
  }
})
</script>

<template>
    <div class="max-w-7xl mx-auto space-y-8">
        <!-- Template Selector -->
    <div class="flex gap-3 mb-6">
      <div
        v-for="tile in tileOptions"
        :key="tile.id"
        @click="selectTile(tile)"
        :class="[
          'group cursor-pointer rounded-md overflow-hidden transition-all duration-200 hover:shadow-md aspect-square h-46',
          selectedTileId === tile.id
            ? 'ring-2 ring-blue-500 shadow-sm bg-blue-50/50'
            : 'shadow-sm hover:shadow-sm bg-background/50 border border-border/50'
        ]"
      >
        <!-- Thumbnail content -->
        <div class="relative w-full h-full bg-gradient-to-br from-muted/20 to-muted/40">
          <!-- Preview text content -->
          <div class="absolute inset-0 flex items-center justify-center p-2">
            <p class="text-foreground/70 text-xs font-mono leading-tight text-center line-clamp-3">
              {{ tile.preview }}
            </p>
          </div>

          <!-- Title bar -->
          <div class="absolute bottom-0 left-0 right-0 p-2 bg-background/90 backdrop-blur-sm border-t border-border/20">
            <div class="flex items-center justify-between">
              <h3 class="text-foreground text-xs font-medium truncate">{{ tile.name }}</h3>

              <!-- Selection indicator -->
              <div
                v-if="selectedTileId === tile.id"
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
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Text Input Card -->
      <Card class="h-fit shadow-xl border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader class="space-y-3">
          <div class="flex items-center justify-between">
            <CardTitle class="text-2xl font-semibold flex items-center space-x-2">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Ontwerp Je Tegel</span>
            </CardTitle>
            <div class="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline" class="text-xs">
                {{ lineCount }} {{ lineCount === 1 ? 'regel' : 'regels' }}
              </Badge>
              <Badge variant="outline" class="text-xs">
                {{ characterCount }} tekens
              </Badge>
            </div>
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
                  <p class="text-xs">Gebruik Enter voor regelafbreking<br/>Selecteer tekst en klik Vet of gebruik Ctrl+B</p>
                </TooltipContent>
              </Tooltip>
            </Label>

            <!-- Formatting Toolbar -->
            <div class="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg border">
              <Button
                @click="toggleBold"
                variant="ghost"
                size="sm"
                class="h-8 px-2 font-bold hover:bg-background"
                title="Vet (Ctrl+B)"
              >
                Vet
              </Button>
              <Separator orientation="vertical" class="h-6" />
              <span class="text-xs text-muted-foreground">Selecteer tekst en klik Vet of gebruik Ctrl+B</span>
            </div>

            <!-- WYSIWYG Editor -->
            <div
              id="tile-text"
              ref="editorRef"
              contenteditable="true"
              class="min-h-[200px] p-3 text-base bg-background/50 border-2 border-border/50 focus:border-blue-400 focus:outline-none transition-colors resize-none rounded-md overflow-y-auto wysiwyg-editor"
              @input="handleEditorInput"
              @keydown="handleEditorKeydown"
              placeholder="Voer hier je tegeltekst in..."
            ></div>
          </div>

          <Separator />

          <div class="grid grid-cols-1 gap-3 text-sm">
            <div class="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
              <div>
                <p class="font-medium">Vette Tekst</p>
                <p class="text-muted-foreground">Selecteer tekst en klik de Vet knop of gebruik Ctrl+B</p>
              </div>
            </div>
          </div>

          <Separator />

          <div class="flex flex-col space-y-3">
            <Button
              @click="generateFinalPdf"
              :disabled="isLoading || !value.trim()"
              size="lg"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg v-if="!isLoading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ isLoading ? 'PDF Genereren...' : 'Genereer Printbare PDF' }}
            </Button>
            <p class="text-xs text-muted-foreground text-center">
              Maakt een A4 liggend PDF bestand met twee tegels klaar om te printen op stickerpapier
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Preview Card -->
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
              <div v-if="isLoading" class="flex flex-col items-center justify-center h-96 space-y-4">
                <div class="space-y-3 w-full max-w-sm">
                  <Skeleton class="h-4 w-full" />
                  <Skeleton class="h-4 w-3/4" />
                  <Skeleton class="h-4 w-1/2" />
                </div>
                <div class="flex items-center space-x-2 text-sm text-muted-foreground">
                  <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Voorbeeld bijwerken...</span>
                </div>
              </div>
              <div
                v-else
                ref="containerRef"
                class="flex items-center justify-center overflow-hidden rounded-lg w-full aspect-square mx-auto transition-all duration-300 hover:shadow-lg"
              >
                <canvas
                  ref="canvasRef"
                  class="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/main.css";

/* Custom scrollbar for textarea */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-muted rounded-lg;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-border rounded-lg hover:bg-border/80;
}

/* PDF canvas styling */
canvas {
  filter: drop-shadow(0 4px 6px -1px rgba(0, 0, 0, 0.1));
  border-radius: 8px;
}

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

/* Animation for loading state */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px);
  background-size: 200px;
}
</style>
