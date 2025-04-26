"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { FileText, FileCode, FileImage, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/error-boundary"

// Import ReactMarkdown dynamically to avoid SSR issues
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-full w-full bg-muted rounded"></div>,
})

interface DocumentPreviewProps {
  file: File | null
  className?: string
}

export function DocumentPreview({ file, className }: DocumentPreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"text" | "html" | "markdown" | "pdf" | "image" | "other">("text")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    // Determine preview type based on file extension or MIME type
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    const fileType = file.type

    if (fileType === "application/pdf" || fileExtension === "pdf") {
      setPreviewType("pdf")
    } else if (fileType === "text/markdown" || fileExtension === "md") {
      setPreviewType("markdown")
    } else if (fileType === "text/html" || fileExtension === "html") {
      setPreviewType("html")
    } else if (fileType.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "svg"].includes(fileExtension)) {
      setPreviewType("image")
    } else if (fileType.startsWith("text/") || ["txt", "log", "json", "xml", "csv"].includes(fileExtension)) {
      setPreviewType("text")
    } else {
      setPreviewType("other")
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      setIsLoading(false)
    }

    reader.onerror = () => {
      setError("Failed to read file. The file might be corrupted or too large.")
      setIsLoading(false)
    }

    try {
      // For PDFs, read as data URL
      if (previewType === "pdf" || previewType === "image") {
        reader.readAsDataURL(file)
      } else {
        // For text-based files, read as text
        reader.readAsText(file)
      }
    } catch (err) {
      setError("An error occurred while reading the file.")
      setIsLoading(false)
    }
  }, [file, previewType])

  if (!file) {
    return null
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Preview...
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mb-4 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading document preview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Preview Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Preview is not available for this file. You can still upload it if it meets the requirements.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          {previewType === "text" && <FileText className="h-4 w-4 mr-2" />}
          {previewType === "html" && <FileCode className="h-4 w-4 mr-2" />}
          {previewType === "markdown" && <FileCode className="h-4 w-4 mr-2" />}
          {previewType === "image" && <FileImage className="h-4 w-4 mr-2" />}
          {previewType === "pdf" && <FileText className="h-4 w-4 mr-2" />}
          {previewType === "other" && <FileText className="h-4 w-4 mr-2" />}
          Document Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {previewType === "pdf" && preview && (
          <div className="h-[400px] w-full overflow-hidden rounded border">
            <iframe
              src={preview}
              className="h-full w-full"
              title="PDF Preview"
              sandbox="allow-scripts"
              loading="lazy"
            ></iframe>
          </div>
        )}

        {previewType === "image" && preview && (
          <div className="flex items-center justify-center p-4 h-[400px] overflow-auto">
            <img
              src={preview || "/placeholder.svg"}
              alt="Document Preview"
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        )}

        {previewType === "markdown" && preview && (
          <div className="h-[400px] overflow-auto border rounded p-4 prose prose-sm dark:prose-invert max-w-none">
            <ErrorBoundary>
              <ReactMarkdown>{preview}</ReactMarkdown>
            </ErrorBoundary>
          </div>
        )}

        {previewType === "html" && preview && (
          <Tabs defaultValue="rendered" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="rendered">Rendered</TabsTrigger>
              <TabsTrigger value="source">Source</TabsTrigger>
            </TabsList>
            <TabsContent value="rendered" className="h-[400px] overflow-auto border rounded">
              <ErrorBoundary>
                <div
                  className="p-4 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="source" className="h-[400px] overflow-auto">
              <pre className="text-xs p-4 bg-muted rounded font-mono">{preview}</pre>
            </TabsContent>
          </Tabs>
        )}

        {previewType === "text" && preview && (
          <div className="h-[400px] overflow-auto border rounded">
            <pre className="p-4 text-sm whitespace-pre-wrap font-mono">{preview}</pre>
          </div>
        )}

        {previewType === "other" && (
          <div className="h-[400px] flex items-center justify-center border rounded">
            <div className="text-center p-4">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Preview is not available for this file type. You can still upload it if it meets the requirements.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
