"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDocuments } from "@/lib/db"
import type { Document } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"

export function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    async function loadDocuments() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getDocuments()
        setDocuments(data.slice(0, 5)) // Get the 5 most recent documents
      } catch (err) {
        console.error("Error loading documents:", err)
        setError("Failed to load recent documents")
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [])

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Recently added or updated documents</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/documents">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No documents found</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/upload">Upload your first document</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">{doc.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.category} • {formatDate(doc.updated_at)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/documents/${doc.id}`}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">View document</span>
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
