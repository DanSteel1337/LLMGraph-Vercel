// This is a server-side alternative for PDF processing
// It uses a different approach that doesn't require the worker

import { createReadStream } from "fs"

// Simple text extraction function that works on the server
export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // For server-side, we'll use a simpler approach
    // Convert buffer to a string and extract text using regex
    // This is not as robust as PDF.js but works for basic PDFs
    const text = buffer.toString("utf-8")

    // Extract text content using regex
    // This is a simplified approach and won't work for all PDFs
    const textMatches = text.match(/$$([^)]+)$$/g)
    if (!textMatches) return ""

    // Clean up the extracted text
    return textMatches
      .map((match) => match.slice(1, -1))
      .filter((text) => /[a-zA-Z0-9]/.test(text))
      .join(" ")
  } catch (error) {
    console.error("Error extracting text from PDF buffer:", error)
    return ""
  }
}

// Function to handle PDF file path
export async function extractTextFromPDFFile(filePath: string): Promise<string> {
  try {
    // Read the file as a buffer
    const chunks: Buffer[] = []
    const stream = createReadStream(filePath)

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }

    const buffer = Buffer.concat(chunks)
    return extractTextFromPDFBuffer(buffer)
  } catch (error) {
    console.error("Error extracting text from PDF file:", error)
    return ""
  }
}
