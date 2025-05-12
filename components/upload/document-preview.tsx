"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface DocumentPreviewProps {
  file: File
}

export function DocumentPreview({ file }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      setError(null)
      return
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
    <div className="w-full h-64 border rounded overflow-hidden">
      <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full" title="Document Preview" />
    </div>
  )
}
