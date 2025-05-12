"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getDocuments } from "@/lib/db"
import type { Document } from "@/lib/db"

export function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getDocuments()
        setDocuments(data.slice(0, 5)) // Get only the 5 most recent documents
      } catch (error) {
        console.error("Error fetching recent documents:", error)
        setError("Failed to fetch recent documents")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentDocuments()
  }, [])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-sm text-muted-foreground">{error}</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">No documents available</div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="space-y-1">
                <div className="font-medium">{doc.title}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{doc.category}</Badge>
                  {doc.metadata?.version && <Badge variant="secondary">{doc.metadata.version}</Badge>}
                  <span className="text-xs">{formatDate(doc.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
