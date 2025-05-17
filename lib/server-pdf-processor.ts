// This file contains server-side PDF processing functionality
import * as pdfjsLib from "pdfjs-dist"

// Import the PDF.js polyfills for Node.js environment
import "@/lib/pdf-node-polyfill"

// Initialize PDF.js worker
// This is a workaround for PDF.js in Node.js environment
if (typeof window === "undefined") {
  // Server-side only - use dynamic import for ESM compatibility
  // We'll use a fallback approach for server-side
  try {
    // For server-side, we'll set a dummy worker or use the Node.js specific approach
    pdfjsLib.GlobalWorkerOptions.workerSrc = "" // Disable worker for server-side
  } catch (error) {
    console.error("Error setting up PDF.js worker on server:", error)
  }
}

/**
 * Extract text from a PDF buffer
 * @param buffer PDF file as Buffer
 * @returns Extracted text
 */
export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Load PDF document with disableWorker option for server-side
    const data = new Uint8Array(buffer)
    const loadingTask = pdfjsLib.getDocument({
      data,
      disableWorker: true, // Disable worker on server-side
    })
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
