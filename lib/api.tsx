"use client"

// API client for frontend
import type { SearchResult } from "@/components/search/search-interface"
import type { Document } from "@/components/documents/document-management"

// Define Feedback type to match what's expected in the application
export interface Feedback {
  id: string
  query: string
  result: string
  rating: number
  comment?: string
  status: "pending" | "reviewed" | "resolved"
  createdAt: string
  userId?: string
}

// Standard API response type
interface ApiResponse<T> {
  data: T
  error?: string
  metadata?: Record<string, any>
}

// Helper function to handle API errors with standardized response format
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`API error (${response.status}): ${errorText}`)
  }

  const jsonData = await response.json()

  // Standardize the response format
  return {
    data: jsonData.documents || jsonData.feedback || jsonData.results || jsonData.data || jsonData,
    error: jsonData.error,
    metadata: jsonData.metadata || {},
  }
}

// Fetch documents
export async function fetchDocuments(): Promise<Document[]> {
  try {
    const response = await fetch("/api/documents", {
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    const result = await handleApiResponse<any[]>(response)

    if (!Array.isArray(result.data)) {
      console.warn("Expected array of documents but got:", typeof result.data)
      return []
    }

    return result.data.map((doc: any) => ({
      id: doc.id,
      title: doc.title || "Untitled Document",
      category: doc.category || "Uncategorized",
      version: doc.metadata?.version || "",
      uploadedAt: doc.created_at || new Date().toISOString(),
      status: doc.status || "processed",
      size: doc.metadata?.size || 0,
    }))
  } catch (error) {
    console.error("Error fetching documents:", error)
    // Return empty array as fallback
    return []
  }
}

// Delete document
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    })

    await handleApiResponse<{ success: boolean }>(response)
    return true
  } catch (error) {
    console.error("Error deleting document:", error)
    return false
  }
}

// Update document
export async function updateDocument(id: string, data: Partial<Document>): Promise<Document | null> {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await handleApiResponse<{ document: Document }>(response)
    return result.data.document || null
  } catch (error) {
    console.error("Error updating document:", error)
    return null
  }
}

// Fetch feedback
export async function fetchFeedback(): Promise<Feedback[]> {
  try {
    const response = await fetch("/api/feedback", {
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    const result = await handleApiResponse<any[]>(response)

    if (!Array.isArray(result.data)) {
      console.warn("Expected array of feedback but got:", typeof result.data)
      return []
    }

    return result.data.map((item: any) => ({
      id: item.id,
      query: item.query || "",
      result: item.result || "",
      rating: item.rating || 0,
      comment: item.comment || "",
      status: item.status || "pending",
      createdAt: item.created_at || new Date().toISOString(),
      userId: item.user_id || undefined,
    }))
  } catch (error) {
    console.error("Error fetching feedback:", error)
    // Return empty array as fallback
    return []
  }
}

// Update feedback status
export async function updateFeedbackStatus(id: string, status: "pending" | "reviewed" | "resolved"): Promise<boolean> {
  try {
    const response = await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    await handleApiResponse<{ success: boolean }>(response)
    return true
  } catch (error) {
    console.error("Error updating feedback status:", error)
    return false
  }
}

// Perform search
export async function performSearch(params: {
  query: string
  mode: string
  filters: {
    categories: string[]
    versions: string[]
  }
  generateAnswer?: boolean
}): Promise<{
  results: SearchResult[]
  answer?: string
}> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("query", params.query)

    if (params.filters.categories.length > 0) {
      queryParams.append("category", params.filters.categories[0])
    }

    if (params.filters.versions.length > 0) {
      queryParams.append("version", params.filters.versions[0])
    }

    if (params.generateAnswer) {
      queryParams.append("generateAnswer", "true")
    }

    const response = await fetch(`/api/search?${queryParams.toString()}`)
    const result = await handleApiResponse<{ results: SearchResult[]; answer?: string }>(response)

    return {
      results: Array.isArray(result.data.results) ? result.data.results : [],
      answer: result.data.answer || undefined,
    }
  } catch (error) {
    console.error("Error performing search:", error)
    // Return empty results as fallback
    return {
      results: [],
    }
  }
}

// Fetch stats
export async function fetchStats(): Promise<any> {
  try {
    // Add cache-busting parameter to prevent caching issues
    const timestamp = new Date().getTime()
    const response = await fetch(`/api/stats?_=${timestamp}`, {
      // Add proper headers
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      // Add a reasonable timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    const result = await handleApiResponse<any>(response)
    return result.data
  } catch (error) {
    console.error("Error fetching stats:", error)

    // Return fallback data instead of null
    return {
      totalDocuments: 0,
      totalSearches: 0,
      totalFeedback: 0,
      vectorCount: 0,
      dimensions: 0,
      indexName: "unknown",
      isError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  }
}

// Process PDF
export async function processPDF(
  file: File,
  metadata: {
    title: string
    category: string
    version?: string
    documentId: string
  },
): Promise<any> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", metadata.title)
    formData.append("category", metadata.category)
    formData.append("version", metadata.version || "1.0")
    formData.append("documentId", metadata.documentId)

    const response = await fetch("/api/process-pdf", {
      method: "POST",
      body: formData,
    })

    const result = await handleApiResponse<any>(response)
    return result.data
  } catch (error) {
    console.error("Error processing PDF:", error)
    throw error
  }
}

// Check health
export async function checkHealth(): Promise<any> {
  try {
    console.log("Initiating health check")
    // Add cache-busting parameter and timeout
    const timestamp = new Date().getTime()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`/api/health?_=${timestamp}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId) // Clear the timeout if the request completes

    const result = await handleApiResponse<any>(response)
    return result.data
  } catch (error) {
    // Provide detailed error logging
    if (error.name === "AbortError") {
      console.error("Health check timed out after 5 seconds")
    } else {
      console.error("Error checking health:", error)
    }

    // Return fallback health data
    return {
      status: "unhealthy",
      api: { status: "unknown", message: "Could not check API status" },
      database: { status: "unknown", message: "Could not check database status" },
      pinecone: { status: "unknown", message: "Could not check Pinecone status" },
      openai: { status: "unknown", message: "Could not check OpenAI status" },
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      debug: {
        clientError: error instanceof Error ? error.message : String(error),
        clientStack: error instanceof Error ? error.stack : undefined,
      },
    }
  }
}
