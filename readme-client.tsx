"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "./error-boundary"

// Dynamically import the markdown renderer with ssr: false
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 bg-muted rounded-md"></div>,
})

export function ReadmeClient({ content }: { content: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="animate-pulse h-96 bg-muted rounded-md"></div>
  }

  return (
    <ErrorBoundary>
      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </ErrorBoundary>
  )
}
