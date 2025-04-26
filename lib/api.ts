// This file contains API functions to interact with the backend

// Base API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

// Dashboard API functions
export async function fetchStats() {
  return apiRequest("/api/stats")
}

export async function fetchRecentDocuments() {
  return apiRequest("/api/documents/recent")
}

export async function fetchPopularSearches() {
  return apiRequest("/api/searches/popular")
}

export async function fetchCategoryDistribution() {
  return apiRequest("/api/categories/distribution")
}

// Document management API functions
export async function uploadDocument(formData: FormData) {
  const response = await fetch(`${API_URL}/api/documents`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchDocuments() {
  return apiRequest("/api/documents")
}

export async function deleteDocument(id: string) {
  return apiRequest(`/api/documents/${id}`, {
    method: "DELETE",
  })
}

export async function updateDocument(id: string, data: any) {
  return apiRequest(`/api/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Search API functions
export async function fetchCategories() {
  return apiRequest("/api/categories")
}

export async function fetchVersions() {
  return apiRequest("/api/versions")
}

export async function performSearch(params: {
  query: string
  mode: "semantic" | "keyword" | "hybrid"
  filters: {
    categories: string[]
    versions: string[]
  }
}) {
  return apiRequest("/api/search", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

// Feedback API functions
export async function fetchFeedback() {
  return apiRequest("/api/feedback")
}

export async function updateFeedbackStatus(id: string, status: "approved" | "rejected") {
  return apiRequest(`/api/feedback/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export async function submitFeedback(data: {
  documentId: string
  content: string
  correction: string
  submittedBy?: string
}) {
  return apiRequest("/api/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
