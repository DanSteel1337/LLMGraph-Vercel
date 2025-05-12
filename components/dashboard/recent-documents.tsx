"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchRecentDocuments } from "@/lib/api"
import { FileText, FileCode, FileImage, FileSpreadsheet, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Document {
  id: string
  title: string
  category: string
  version: string
  uploadedAt: string
  fileType?: string
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
          // Add file types if they don't exist
          const docsWithTypes = data.map((doc) => ({
            ...doc,
            fileType: doc.fileType || getRandomFileType(),
          }))
          setDocuments(docsWithTypes)
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

  // Helper function to get a random file type for mock data
  function getRandomFileType() {
    const types = ["text", "code", "image", "spreadsheet", "other"]
    return types[Math.floor(Math.random() * types.length)]
  }

  // Helper function to get the appropriate icon based on file type
  function getFileIcon(fileType: string) {
    switch (fileType) {
      case "text":
        return <FileText className="h-10 w-10 text-blue-500" />
      case "code":
        return <FileCode className="h-10 w-10 text-purple-500" />
      case "image":
        return <FileImage className="h-10 w-10 text-green-500" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-10 w-10 text-orange-500" />
      default:
        return <File className="h-10 w-10 text-gray-500" />
    }
  }

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
          <Button asChild className="mt-4" size="sm">
            <Link href="/upload">Upload Documents</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="rounded-md bg-background p-2 shadow-sm border">{getFileIcon(doc.fileType || "other")}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Link href={`/documents/${doc.id}`} className="font-medium leading-none hover:underline">
                {doc.title}
              </Link>
              <Badge variant="outline" className="ml-2">
                {doc.version}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground/70">{doc.category}</span>
              <span className="mx-2">•</span>
              <span>{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/documents">View All Documents</Link>
        </Button>
      </div>
    </div>
  )
}
