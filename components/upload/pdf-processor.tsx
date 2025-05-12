"use client"

import { useEffect, useState } from "react"

// We'll dynamically import PDF.js only on the client side
let pdfjsLib: any = null

export function usePdfProcessor() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Only import PDF.js on the client side
    const loadPdfJs = async () => {
      try {
        // Dynamic import to avoid server-side issues
        pdfjsLib = await import("pdfjs-dist")

        // Set up the worker
        const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry")
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

        setIsReady(true)
      } catch (error) {
        console.error("Error loading PDF.js:", error)
      }
    }

    loadPdfJs()

    return () => {
      // Clean up if needed
    }
  }, [])

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    if (!isReady || !pdfjsLib) {
      throw new Error("PDF processor not ready")
    }

    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
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
