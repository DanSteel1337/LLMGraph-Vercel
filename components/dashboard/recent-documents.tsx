"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecentDocuments } from "@/lib/api"

interface Document {
  id: string
  title: string
  category: string
  version: string
  uploadedAt: string
}

export function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getRecentDocuments = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchRecentDocuments()

        // Validate the data structure
        if (!Array.isArray(data)) {
          console.error("Invalid data format for recent documents:", data)
          setDocuments([])
          setError("Received invalid data format")
        } else {
          setDocuments(data)
        }
      } catch (error) {
        console.error("Failed to fetch recent documents:", error)
        setDocuments([])
        setError("Failed to load recent documents")
      } finally {
        setIsLoading(false)
      }
    }

    getRecentDocuments()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Using mock data instead</p>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No documents found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-start gap-4">
          <div className="rounded-md bg-muted p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium leading-none">{doc.title}</p>
              <Badge variant="outline">{doc.version}</Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{doc.category}</span>
              <span className="mx-2">•</span>
              <span>{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
