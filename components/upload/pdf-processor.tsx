"use client"

import { useEffect, useState } from "react"
import { shouldUseMockData } from "@/lib/environment"

// We'll dynamically import PDF.js only on the client side
let pdfjsLib: any = null

// Mock text for development when in mock data mode
const MOCK_PDF_TEXT = `# Unreal Engine Documentation

## Introduction
This is a sample document for the Unreal Engine documentation system. It demonstrates how text extraction would work in a real PDF.

## Features
- Real-time rendering
- Blueprint visual scripting
- C++ programming interface
- Material editor
- Landscape system
- Animation tools

## Getting Started
To get started with Unreal Engine, you'll need to download the Epic Games Launcher and install the engine.

## System Requirements
- Windows 10 64-bit
- macOS 10.15+
- 8GB RAM minimum
- Quad-core processor
- DirectX 11 or Metal compatible graphics card

Thank you for using our documentation system!
`

export function usePdfProcessor() {
  const [isReady, setIsReady] = useState(false)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      setIsMockData(true)
      setIsReady(true)
      return
    }

    // Only import PDF.js on the client side
    const loadPdfJs = async () => {
      try {
        // Dynamic import to avoid server-side issues
        pdfjsLib = await import("pdfjs-dist")

        // Set up the worker using dynamic import
        // This is the key fix - using dynamic import for the worker
        const workerUrl = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString()

        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

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
    // Return mock text if in mock data mode
    if (isMockData) {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return MOCK_PDF_TEXT
    }

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
    isMockData,
  }
}
