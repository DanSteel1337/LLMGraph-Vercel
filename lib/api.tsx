// API client for frontend
import type { SearchResult } from "@/components/search/search-results"
import type { Document } from "@/components/documents/document-management"
import type { Feedback } from "@/components/feedback/feedback-management"

// Fetch documents
export async function fetchDocuments(): Promise<Document[]> {
  try {
    const response = await fetch("/api/documents")

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`)
    }

    const data = await response.json()

    return data.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      version: doc.metadata?.version || "",
      uploadedAt: doc.created_at || new Date().toISOString(),
      status: "processed",
      size: doc.metadata?.size || 0,
    }))
  } catch (error) {
    console.error("Error fetching documents:", error)
    return []
  }
}

// Delete document
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`)
    }

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

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`)
    }

    const result = await response.json()

    return result.document
  } catch (error) {
    console.error("Error updating document:", error)
    return null
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

    if (!response.ok) {
      throw new Error(`Failed to perform search: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      results: data.results || [],
      answer: data.answer || null,
    }
  } catch (error) {
    console.error("Error performing search:", error)
    return { results: [] }
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

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Stats API returned status ${response.status}: ${errorText}`)
      throw new Error(`Failed to fetch stats: ${response.statusText || response.status}`)
    }

    const data = await response.json()
    return data
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

// Fetch feedback
export async function fetchFeedback(): Promise<Feedback[]> {
  try {
    const response = await fetch("/api/feedback")

    if (!response.ok) {
      throw new Error(`Failed to fetch feedback: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return []
  }
}

// Update feedback status
export async function updateFeedbackStatus(id: string, status: "approved" | "rejected"): Promise<boolean> {
  try {
    const response = await fetch(`/api/feedback/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update feedback status: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error updating feedback status:", error)
    return false
  }
}

// Submit feedback
export async function submitFeedback(data: {
  documentId: string
  content: string
  correction: string
}): Promise<boolean> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return false
  }
}

// Check health
export async function checkHealth(): Promise<any> {
  try {
    console.log("Initiating health check")
    // Add cache-busting parameter and timeout
    const timestamp = new Date().getTime()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout (increased from 5)

    const response = await fetch(`/api/health?_=${timestamp}`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId) // Clear the timeout if the request completes

    // Even if the response is not OK, try to parse the JSON response
    // as our API now returns 200 with error details instead of 500
    const data = await response.json().catch((e) => {
      console.error("Failed to parse health check response:", e)
      return null
    })

    if (data) {
      console.log("Health check completed with status:", data.status)
      if (data.debug?.errors?.length > 0) {
        console.warn("Health check errors:", data.debug.errors)
      }
      return data
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Health API returned status ${response.status}: ${errorText}`)
      throw new Error(`Health check failed: ${response.statusText || response.status}`)
    }

    throw new Error("Failed to get valid health check data")
  } catch (error) {
    // Provide detailed error logging
    if (error.name === "AbortError") {
      console.error("Health check timed out after 10 seconds")
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

// Fetch categories
export async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await fetch("/api/categories")

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

// Fetch versions
export async function fetchVersions(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await fetch("/api/versions")

    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching versions:", error)
    return []
  }
}
