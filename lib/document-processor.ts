// lib/document-processor.ts

import * as pdfjsLib from "pdfjs-dist"
// @ts-ignore
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry"

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

    const pdf = await pdfjsLib.getDocument(buffer).promise
    let textContent = ""

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const text = await page.getTextContent()
      textContent += text.items.map((s: any) => s.str).join(" ") + "\n"
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
