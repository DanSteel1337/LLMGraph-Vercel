// lib/document-processor.ts

// Avoid importing PDF.js directly in server components
// We'll use a different approach for PDF processing

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // In a server environment, we'll use a simple text extraction
    // This is a basic implementation that works for simple PDFs
    const text = buffer.toString("utf-8")

    // Try to extract text content using regex
    // This won't work for all PDFs but provides a fallback
    const textMatches = text.match(/$$([^$$]+)\)/g)
    if (textMatches) {
      return textMatches
        .map((match) => match.slice(1, -1))
        .filter((text) => /[a-zA-Z0-9]/.test(text))
        .join(" ")
    }

    // If regex extraction fails, return a placeholder
    return "PDF text extraction requires client-side processing. Upload completed, but full-text search may be limited."
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
