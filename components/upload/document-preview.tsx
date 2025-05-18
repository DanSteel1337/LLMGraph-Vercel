"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { shouldUseMockData } from "@/lib/environment"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DocumentPreviewProps {
  file: File
}

export function DocumentPreview({ file }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      setError(null)
      return
    }

    // Check if we should use mock data
    if (shouldUseMockData()) {
      setIsMockData(true)
      // In mock mode, we'll still try to create a preview if it's a PDF
      if (file.type !== "application/pdf") {
        setError("Preview is only available for PDF files")
        setIsLoading(false)
        return
      }
    }

    // Only handle PDF files
    if (file.type !== "application/pdf") {
      setError("Preview is only available for PDF files")
      setIsLoading(false)
      return
    }

    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setIsLoading(false)

    // Clean up the object URL when component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [file])

  if (error) {
    return <div className="text-sm text-muted-foreground">{error}</div>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!previewUrl) {
    return null
  }

  return (
    <div className="space-y-4">
      {isMockData && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preview Mode</AlertTitle>
          <AlertDescription>You are in preview mode. Some preview features may be limited.</AlertDescription>
        </Alert>
      )}
      <div className="w-full h-64 border rounded overflow-hidden">
        <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full" title="Document Preview" />
      </div>
    </div>
  )
}
