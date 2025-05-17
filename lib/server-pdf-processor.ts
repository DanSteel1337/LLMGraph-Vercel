// Polyfill for DOMMatrix before any imports
if (typeof global !== "undefined" && typeof global.DOMMatrix === "undefined") {
  class DOMMatrixPolyfill {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0
    m11 = 1
    m12 = 0
    m13 = 0
    m14 = 0
    m21 = 0
    m22 = 1
    m23 = 0
    m24 = 0
    m31 = 0
    m32 = 0
    m33 = 1
    m34 = 0
    m41 = 0
    m42 = 0
    m43 = 0
    m44 = 1
    is2D = true
    isIdentity = true

    constructor(init?: string | number[]) {
      // Basic initialization logic
      if (init && Array.isArray(init)) {
        if (init.length === 6) {
          ;[this.a, this.b, this.c, this.d, this.e, this.f] = init
          this.m11 = this.a
          this.m12 = this.b
          this.m21 = this.c
          this.m22 = this.d
          this.m41 = this.e
          this.m42 = this.f
        }
      }
    }

    // Minimal required methods
    multiply() {
      return new DOMMatrixPolyfill()
    }
    inverse() {
      return new DOMMatrixPolyfill()
    }
    translate() {
      return new DOMMatrixPolyfill()
    }
  }
  // Assign to global
  ;(global as any).DOMMatrix = DOMMatrixPolyfill
}

// Additional DOM polyfills that might be needed
if (typeof global !== "undefined") {
  if (typeof global.DOMPoint === "undefined") {
    ;(global as any).DOMPoint = class DOMPoint {
      x = 0
      y = 0
      z = 0
      w = 1
      constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x
        this.y = y
        this.z = z
        this.w = w
      }
    }
  }

  if (typeof global.Path2D === "undefined") {
    ;(global as any).Path2D = class Path2D {
      constructor() {}
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      ellipse() {}
      rect() {}
    }
  }
}

// This file contains server-side PDF processing functionality
import * as pdfjsLib from "pdfjs-dist"

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
