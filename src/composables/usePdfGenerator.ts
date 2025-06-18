import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { toast } from 'vue-sonner'

// Set the worker source to use the local npm package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

interface TextSegment {
  text: string
  font: PDFFont
  width: number
}

export function usePdfGenerator() {
  const originalPdfBytes = ref<Uint8Array | null>(null)
  const isLoading = ref(false)

  // Function to parse text and create segments with appropriate fonts
  function parseTextSegments(
    text: string,
    parksideLight: PDFFont,
    parksideBold: PDFFont,
    helvetica: PDFFont,
    fontSize: number,
  ): TextSegment[] {
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
  function parseNormalText(
    text: string,
    parksideFont: PDFFont,
    helvetica: PDFFont,
    fontSize: number,
  ): TextSegment[] {
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
            width: parksideFont.widthOfTextAtSize(currentText, fontSize),
          })
          currentText = ''
        }

        // Add left spacing for punctuation marks
        const leftSpacing = fontSize * 0.05 // 10% of font size as left spacing
        segments.push({
          text: ' ', // Invisible spacing character
          font: helvetica,
          width: leftSpacing,
        })

        // Add punctuation mark with Helvetica
        segments.push({
          text: char,
          font: helvetica,
          width: helvetica.widthOfTextAtSize(char, fontSize),
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
        width: parksideFont.widthOfTextAtSize(currentText, fontSize),
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
    const startY = height / 2 + ((textLines.length - 1.5) * lineHeight) / 2

    // Add the new text line by line (overlaying on original PDF content)
    textLines.forEach((line, index) => {
      const y = startY - index * lineHeight

      // Parse the line for different formatting
      const segments = parseTextSegments(line, parksideLight, parksideBold, helvetica, fontSize)

      // Calculate total width to center the line
      const totalWidth = segments.reduce((sum, segment) => sum + segment.width, 0)
      let currentX = (width - totalWidth) / 2 - 3

      // Draw each segment with its appropriate font
      segments.forEach((segment) => {
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

  // Function to generate final A4 landscape PDF with duplicated content
  async function generateFinalPdf(text: string) {
    if (!originalPdfBytes.value) return

    isLoading.value = true
    try {
      // Create the modified PDF first
      const modifiedPdfBytes = await createModifiedPdf(text)

      // Load the modified PDF to get its pages
      const modifiedPdfDoc = await PDFDocument.load(modifiedPdfBytes)

      // Create a new A4 landscape PDF document
      const finalPdfDoc = await PDFDocument.create()
      finalPdfDoc.registerFontkit(fontkit)

      // A4 landscape dimensions (842 x 595 points)
      const a4LandscapeWidth = 842
      const a4LandscapeHeight = 595
      const finalPage = finalPdfDoc.addPage([a4LandscapeWidth, a4LandscapeHeight])

      // Get the first page from the modified PDF
      const modifiedPages = modifiedPdfDoc.getPages()
      const sourcePage = modifiedPages[0]

      // Get the original page dimensions
      const { width: originalWidth, height: originalHeight } = sourcePage.getSize()

      // Create form objects from the page content to embed as high-quality vector graphics
      const embeddedPage = await finalPdfDoc.embedPage(sourcePage)

      // Calculate scaling to fit the original size on half of A4 landscape
      const targetWidth = a4LandscapeWidth / 2 // Exactly half the page width
      const targetHeight = a4LandscapeHeight // Full page height

      // Calculate scale to maintain aspect ratio
      const scaleX = targetWidth / originalWidth
      const scaleY = targetHeight / originalHeight
      const scale = Math.min(scaleX, scaleY)

      const scaledWidth = originalWidth * scale
      const scaledHeight = originalHeight * scale

      // Calculate positions for perfect fit in each half
      const leftX = a4LandscapeWidth / 4 - scaledWidth / 2 // Center on left half
      const rightX = (3 * a4LandscapeWidth) / 4 - scaledWidth / 2 // Center on right half
      const y = a4LandscapeHeight - scaledHeight // Align at top with no margin

      // Draw the embedded page on the left side
      finalPage.drawPage(embeddedPage, {
        x: leftX,
        y: y,
        width: scaledWidth,
        height: scaledHeight,
      })

      // Draw the same embedded page on the right side (copy)
      finalPage.drawPage(embeddedPage, {
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
        description: 'Het PDF-bestand wordt naar je downloads map gedownload.',
      })

      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Error generating final PDF:', error)
      toast.error('Er is een fout opgetreden bij het genereren van de PDF', {
        description: 'Probeer het opnieuw of contact de ondersteuning.',
      })
    } finally {
      isLoading.value = false
    }
  }

  // Load the original PDF on initialization
  async function loadOriginalPdf() {
    try {
      const response = await fetch('/solo-tegel-verdorie.pdf')
      originalPdfBytes.value = new Uint8Array(await response.arrayBuffer())
    } catch (error) {
      console.error('Error loading original PDF:', error)
    }
  }

  return {
    originalPdfBytes: readonly(originalPdfBytes),
    isLoading: readonly(isLoading),
    createModifiedPdf,
    generateFinalPdf,
    loadOriginalPdf,
  }
}
