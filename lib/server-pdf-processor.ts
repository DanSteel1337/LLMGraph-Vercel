// This file contains server-side PDF processing functionality
import * as pdfjsLib from "pdfjs-dist"

// Initialize PDF.js worker
// This is a workaround for PDF.js in Node.js environment
if (typeof window === "undefined") {
  // Server-side only
  const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.js")
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
}

/**
 * Extract text from a PDF buffer
 * @param buffer PDF file as Buffer
 * @returns Extracted text
 */
export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Load PDF document
    const data = new Uint8Array(buffer)
    const loadingTask = pdfjsLib.getDocument({ data })
    const pdf = await loadingTask.promise

    // Get total number of pages
    const numPages = pdf.numPages
    let text = ""

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(" ")

      text += pageText + "\n\n"
    }

    return text
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Fallback function for environments where PDF.js doesn't work
 * @param buffer PDF file as Buffer
 * @returns Mock extracted text
 */
export function extractTextFromPDFBufferFallback(buffer: Buffer): string {
  console.warn("Using PDF extraction fallback - actual content will not be extracted")
  return `This is placeholder text. The actual PDF content could not be extracted. 
  This might be due to environment limitations or PDF.js compatibility issues.
  The PDF size was ${buffer.length} bytes.`
}
