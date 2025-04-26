"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string>("")

  useEffect(() => {
    // Add event listener for chunk load errors
    const handleChunkError = (event: ErrorEvent) => {
      // Check if this is a chunk loading error
      const isChunkLoadError =
        event.message.includes("Loading chunk") ||
        event.message.includes("ChunkLoadError") ||
        /Loading (CSS|chunk) \d+ failed/.test(event.message)

      if (isChunkLoadError) {
        console.error("Chunk loading error detected:", event)
        setHasError(true)
        setErrorDetails(event.message || "Failed to load a required component")

        // Prevent the error from bubbling up
        event.preventDefault()
      }
    }

    // Add event listener
    window.addEventListener("error", handleChunkError)

    // Clean up
    return () => {
      window.removeEventListener("error", handleChunkError)
    }
  }, [])

  // If there's an error, show the fallback UI
  if (hasError) {
    return (
      fallback || (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading content</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              There was a problem loading this content. This might be due to a network issue or a problem with the
              application.
            </p>
            {errorDetails && (
              <p className="text-xs mt-1 font-mono bg-destructive/10 p-2 rounded">Error: {errorDetails}</p>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    )
  }

  // Otherwise, render children
  return <>{children}</>
}
