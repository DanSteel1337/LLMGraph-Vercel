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
    const response = await fetch("/api/stats")

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching stats:", error)
    return null
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
    const response = await fetch("/api/health")

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error checking health:", error)
    return { status: "unhealthy", error: String(error) }
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
