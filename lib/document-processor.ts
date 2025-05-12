// lib/document-processor.ts

import { getDocument } from "pdfjs-dist"

// Configure PDF.js worker
if (typeof window !== "undefined" && "Worker" in window) {
  // Client-side only
  // We don't need to set the worker in server components
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Convert buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer)

    // Load the PDF document
    const loadingTask = getDocument({ data: uint8Array })
    const pdf = await loadingTask.promise

    let textContent = ""

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = content.items.map((item: any) => item.str)
      textContent += strings.join(" ") + "\n"
    }

    return textContent
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    return ""
  }
}

async function extractTextFromTextBasedFile(buffer: Buffer, encoding = "utf8"): Promise<string> {
  try {
    return buffer.toString(encoding)
  } catch (error) {
    console.error("Error extracting text from text-based file:", error)
    return ""
  }
}

export async function extractTextFromFile(buffer: Buffer, filename: string): Promise<string> {
  const fileExtension = filename.split(".").pop()?.toLowerCase() || ""

  try {
    if (fileExtension === "pdf") {
      return await extractTextFromPDF(buffer)
    } else if (
      fileExtension === "txt" ||
      fileExtension === "md" ||
      fileExtension === "html" ||
      fileExtension === "htm" ||
      fileExtension === "xml" ||
      fileExtension === "json" ||
      fileExtension === "csv"
    ) {
      return await extractTextFromTextBasedFile(buffer)
    } else if (fileExtension === "doc" || fileExtension === "docx") {
      // Mock implementation for doc/docx files
      return `Mock text extraction from Word document: ${filename}`
    } else {
      console.warn(`Unsupported file type: ${fileExtension}`)
      return ""
    }
  } catch (error) {
    console.error(`Error extracting text from ${filename}:`, error)
    return ""
  }
}
