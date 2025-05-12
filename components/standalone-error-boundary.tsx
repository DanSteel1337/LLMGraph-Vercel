"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function StandaloneErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by standalone error boundary:", event.error)
      setHasError(true)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-gray-500">
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setHasError(false)
                window.location.reload()
              }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Refresh Page
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
