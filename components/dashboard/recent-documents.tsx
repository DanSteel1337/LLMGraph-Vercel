"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, FileText } from "lucide-react"
import { getDocuments } from "@/lib/db"
import type { Document } from "@/lib/db"

interface RecentDocumentsProps {
  onViewDocument?: (id: string) => void
  limit?: number
}

export function RecentDocuments({ onViewDocument, limit = 5 }: RecentDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getDocuments()
        setDocuments(data.slice(0, limit)) // Get only the most recent documents
      } catch (error) {
        console.error("Error fetching recent documents:", error)
        setError("Failed to fetch recent documents")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentDocuments()
  }, [limit])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Documents</CardTitle>
        {documents.length > 0 && (
          <Button variant="outline" size="sm" asChild>
            <a
              href="#documents"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('[data-value="documents"]')?.click()
              }}
            >
              View All
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
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
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
            <p className="text-muted-foreground">No documents available</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <a
                href="#upload"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('[data-value="upload"]')?.click()
                }}
              >
                Upload Documents
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{doc.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{doc.category}</Badge>
                    {doc.metadata?.version && <Badge variant="secondary">{doc.metadata.version}</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</span>
                  </div>
                </div>
                {onViewDocument && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDocument(doc.id)}
                    className="ml-2 flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:inline-block">View</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
