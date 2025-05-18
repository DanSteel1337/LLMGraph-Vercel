"use client"

import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { shouldUseMockData } from "@/lib/environment"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface RecentDocumentsProps {
  limit?: number
}

// Define document type
interface Document {
  id: string
  title: string
  category: string
  created_at: string
}

// Mock data for development and fallback
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Blueprint Quick Start Guide",
    category: "Blueprints",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Material Editor Reference",
    category: "Materials",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Animation System Overview",
    category: "Animation",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    title: "Physics Simulation Guide",
    category: "Physics",
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "5",
    title: "Rendering Pipeline Documentation",
    category: "Rendering",
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
]

export function RecentDocuments({ limit = 5 }: RecentDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setIsMockData(false)

        // Check if we should use mock data
        if (shouldUseMockData()) {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500))
          setDocuments(MOCK_DOCUMENTS.slice(0, limit))
          setIsMockData(true)
          return
        }

        // Fetch documents from API using apiClient
        const response = await apiClient.get<Document[]>("/api/documents")

        if (response.error) {
          throw new Error(response.error)
        }

        // Check if the response contains mock data
        if (response.isMockData) {
          setIsMockData(true)
        }

        // Sort by created_at and limit
        const sortedDocuments = response.data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)

        setDocuments(sortedDocuments)
      } catch (err) {
        setError("Failed to fetch documents")
        console.error("Error fetching documents:", err)

        // Use mock data as fallback
        setDocuments(MOCK_DOCUMENTS.slice(0, limit))
        setIsMockData(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentDocuments()
  }, [limit])

  return (
    <div>
      {isLoading && (
        <div>
          {Array.from({ length: limit }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full mb-2" />
          ))}
        </div>
      )}
      {error && <div>{error}</div>}
      {!isLoading && !error && (
        <>
          {isMockData && (
            <Alert variant="warning" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Showing mock data. Connect to a database in production.
              </AlertDescription>
            </Alert>
          )}
          <ul>
            {Array.isArray(documents) &&
              documents.map((doc) => (
                <li key={doc.id}>
                  <h3>{doc.title}</h3>
                  <p>{doc.category}</p>
                  <p>{formatDate(doc?.created_at, "N/A")}</p>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  )
}
