"use client"

// API client for frontend
import type { SearchResult } from "@/components/search/search-interface"
import type { Document } from "@/components/documents/document-management"

// Helper function to handle API errors
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`API error (${response.status}): ${errorText}`)
  }
  return response.json()
}

// Fetch documents
export async function fetchDocuments(): Promise<Document[]> {
  try {
    const response = await fetch("/api/documents", {
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    const data = await handleApiResponse(response)

    return data.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      version: doc.metadata?.version || "",
      uploadedAt: doc.created_at || new Date().toISOString(),
      status: doc.status || "processed",
      size: doc.metadata?.size || 0,
    }))
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw error
  }
}

// Delete document
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    })

    await handleApiResponse(response)
    return true
  } catch (error) {
    console.error("Error deleting document:", error)
    throw error
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

    const result = await handleApiResponse(response)
    return result.document
  } catch (error) {
    console.error("Error updating document:", error)
    throw error
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
    const data = await handleApiResponse(response)

    return {
      results: data.results || [],
      answer: data.answer || null,
    }
  } catch (error) {
    console.error("Error performing search:", error)
    throw error
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

    return await handleApiResponse(response)
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

    return await handleApiResponse(response)
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

    return await handleApiResponse(response)
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
