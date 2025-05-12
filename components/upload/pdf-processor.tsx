"use client"

import { useEffect, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"

// This needs to be done in a client component
export function setupPdfWorker() {
  if (typeof window !== "undefined") {
    // Only import the worker in client-side code
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }
}

export function usePdfProcessor() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setupPdfWorker()
    setIsReady(true)
  }, [])

  const extractTextFromPDF = async (buffer: ArrayBuffer): Promise<string> => {
    if (!isReady) {
      throw new Error("PDF processor not ready")
    }

    try {
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const pdf = await loadingTask.promise

      let textContent = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const strings = content.items.map((item: any) => item.str)
        textContent += strings.join(" ") + "\n"
      }

      return textContent
    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      throw error
    }
  }

  return {
    isReady,
    extractTextFromPDF,
  }
}
