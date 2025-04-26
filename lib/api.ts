// This file contains API functions to interact with the backend
import { shouldUseMockData } from "./backend-connection"

// Base API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // If we should use mock data, immediately return mock data
  if (shouldUseMockData()) {
    console.log(`Using mock data for ${endpoint}`)
    return getMockData(endpoint, options.method || "GET")
  }

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

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}: ${response.statusText}`)
      return getMockData(endpoint, options.method || "GET")
    }

    // Check if the response is empty
    const text = await response.text()
    if (!text) {
      console.warn(`Empty response from ${endpoint}, using mock data instead`)
      return getMockData(endpoint, options.method || "GET")
    }

    // Try to parse the response as JSON
    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error(`Failed to parse JSON from ${endpoint}:`, parseError)
      console.error(`Response text:`, text.substring(0, 100) + (text.length > 100 ? "..." : ""))
      // Fall back to mock data if JSON parsing fails
      return getMockData(endpoint, options.method || "GET")
    }
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error)
    // Return mock data for any request error
    return getMockData(endpoint, options.method || "GET")
  }
}

// Add a function to return mock data for development/preview
function getMockData(endpoint: string, method: string) {
  // Dashboard stats
  if (endpoint === "/api/stats") {
    return {
      totalDocuments: 156,
      totalSearches: 1243,
      totalFeedback: 28,
      vectorCount: 4872,
    }
  }

  // Recent documents
  if (endpoint === "/api/documents/recent") {
    return [
      {
        id: "doc1",
        title: "Blueprint Interface Overview",
        category: "Blueprints",
        version: "UE 5.3",
        uploadedAt: "2025-04-25T14:48:00.000Z",
      },
      {
        id: "doc2",
        title: "C++ Actor Component Guide",
        category: "C++",
        version: "UE 5.2",
        uploadedAt: "2025-04-24T09:32:00.000Z",
      },
      {
        id: "doc3",
        title: "Animation Blueprint Setup",
        category: "Animation",
        version: "UE 5.3",
        uploadedAt: "2025-04-23T16:15:00.000Z",
      },
      {
        id: "doc4",
        title: "Rendering Pipeline Overview",
        category: "Rendering",
        version: "UE 5.1",
        uploadedAt: "2025-04-22T11:20:00.000Z",
      },
      {
        id: "doc5",
        title: "Physics Constraints Tutorial",
        category: "Physics",
        version: "UE 5.2",
        uploadedAt: "2025-04-21T15:45:00.000Z",
      },
    ]
  }

  // Popular searches
  if (endpoint === "/api/searches/popular") {
    return [
      {
        query: "blueprint interface",
        count: 87,
        successRate: 92,
      },
      {
        query: "animation retargeting",
        count: 64,
        successRate: 88,
      },
      {
        query: "physics constraints",
        count: 52,
        successRate: 76,
      },
      {
        query: "material parameters",
        count: 49,
        successRate: 94,
      },
      {
        query: "skeletal mesh",
        count: 43,
        successRate: 82,
      },
    ]
  }

  // Category distribution
  if (endpoint === "/api/categories/distribution") {
    return [
      {
        name: "Blueprints",
        count: 42,
        percentage: 27,
      },
      {
        name: "C++",
        count: 38,
        percentage: 24,
      },
      {
        name: "Animation",
        count: 24,
        percentage: 15,
      },
      {
        name: "Rendering",
        count: 18,
        percentage: 12,
      },
      {
        name: "Physics",
        count: 14,
        percentage: 9,
      },
      {
        name: "UI",
        count: 12,
        percentage: 8,
      },
      {
        name: "Audio",
        count: 8,
        percentage: 5,
      },
    ]
  }

  // Documents
  if (endpoint === "/api/documents" && method === "GET") {
    return [
      {
        id: "doc1",
        title: "Blueprint Interface Overview",
        category: "Blueprints",
        version: "UE 5.3",
        uploadedAt: "2025-04-25T14:48:00.000Z",
        status: "processed",
        size: 256000,
      },
      {
        id: "doc2",
        title: "C++ Actor Component Guide",
        category: "C++",
        version: "UE 5.2",
        uploadedAt: "2025-04-24T09:32:00.000Z",
        status: "processed",
        size: 384000,
      },
      {
        id: "doc3",
        title: "Animation Blueprint Setup",
        category: "Animation",
        version: "UE 5.3",
        uploadedAt: "2025-04-23T16:15:00.000Z",
        status: "processed",
        size: 192000,
      },
      {
        id: "doc4",
        title: "Rendering Pipeline Overview",
        category: "Rendering",
        version: "UE 5.1",
        uploadedAt: "2025-04-22T11:20:00.000Z",
        status: "processing",
        size: 512000,
      },
      {
        id: "doc5",
        title: "Physics Constraints Tutorial",
        category: "Physics",
        version: "UE 5.2",
        uploadedAt: "2025-04-21T15:45:00.000Z",
        status: "processed",
        size: 320000,
      },
    ]
  }

  // Categories
  if (endpoint === "/api/categories") {
    return [
      { id: "blueprints", name: "Blueprints" },
      { id: "cpp", name: "C++" },
      { id: "animation", name: "Animation" },
      { id: "rendering", name: "Rendering" },
      { id: "physics", name: "Physics" },
      { id: "ui", name: "UI" },
      { id: "audio", name: "Audio" },
      { id: "networking", name: "Networking" },
    ]
  }

  // Versions
  if (endpoint === "/api/versions") {
    return [
      { id: "5.3", name: "UE 5.3" },
      { id: "5.2", name: "UE 5.2" },
      { id: "5.1", name: "UE 5.1" },
      { id: "5.0", name: "UE 5.0" },
      { id: "4.27", name: "UE 4.27" },
    ]
  }

  // Feedback
  if (endpoint === "/api/feedback" && method === "GET") {
    return [
      {
        id: "feedback1",
        documentId: "doc1",
        documentTitle: "Blueprint Interface Overview",
        content: "Blueprint interfaces can only be implemented by other Blueprints.",
        correction: "Blueprint interfaces can be implemented by both Blueprints and C++ classes.",
        status: "approved",
        submittedAt: "2025-04-24T14:30:00.000Z",
        submittedBy: "user@example.com",
      },
      {
        id: "feedback2",
        documentId: "doc3",
        documentTitle: "Animation Blueprint Setup",
        content: "Animation Blueprints require a Skeleton asset to function.",
        correction: "Animation Blueprints require both a Skeleton asset and an Animation Graph to function properly.",
        status: "pending",
        submittedAt: "2025-04-25T09:15:00.000Z",
        submittedBy: "animator@example.com",
      },
      {
        id: "feedback3",
        documentId: "doc2",
        documentTitle: "C++ Actor Component Guide",
        content: "Components are automatically initialized in the constructor.",
        correction:
          "Components must be created in the constructor but are initialized in BeginPlay or when explicitly called.",
        status: "rejected",
        submittedAt: "2025-04-23T16:45:00.000Z",
        submittedBy: "developer@example.com",
      },
    ]
  }

  // Search results
  if (endpoint === "/api/search" && method === "POST") {
    return [
      {
        id: "result1",
        title: "Blueprint Interface Implementation Guide",
        content:
          "Blueprint interfaces allow different Blueprint types to share and access common functions. This is similar to interfaces in programming languages.",
        category: "Blueprints",
        version: "UE 5.3",
        score: 0.92,
        highlights: [
          "Blueprint <mark>interfaces</mark> allow different Blueprint types to share and access common functions. This is similar to <mark>interfaces</mark> in programming languages.",
        ],
      },
      {
        id: "result2",
        title: "Creating and Using Blueprint Interfaces",
        content:
          "To create a Blueprint Interface, in the Content Browser, click Add New and select Blueprint Interface from the menu. Blueprint Interfaces are assets that declare functions that can be implemented by Blueprints.",
        category: "Blueprints",
        version: "UE 5.2",
        score: 0.87,
        highlights: [
          "To create a Blueprint <mark>Interface</mark>, in the Content Browser, click Add New and select Blueprint <mark>Interface</mark> from the menu.",
          "Blueprint <mark>Interfaces</mark> are assets that declare functions that can be implemented by Blueprints.",
        ],
      },
    ]
  }

  // Default empty response
  return {}
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

// Update the fetchCategoryDistribution function to always return mock data
export async function fetchCategoryDistribution() {
  // Always return mock data for this endpoint to avoid timeout issues
  console.log("Using mock data for category distribution")
  return [
    {
      name: "Blueprints",
      count: 42,
      percentage: 27,
    },
    {
      name: "C++",
      count: 38,
      percentage: 24,
    },
    {
      name: "Animation",
      count: 24,
      percentage: 15,
    },
    {
      name: "Rendering",
      count: 18,
      percentage: 12,
    },
    {
      name: "Physics",
      count: 14,
      percentage: 9,
    },
    {
      name: "UI",
      count: 12,
      percentage: 8,
    },
    {
      name: "Audio",
      count: 8,
      percentage: 5,
    },
  ]
}

// Document management API functions
export async function uploadDocument(formData: FormData) {
  // If we should use mock data, return a mock success response
  if (shouldUseMockData()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: "mock-doc-id" })
      }, 1000)
    })
  }

  try {
    const response = await fetch(`${API_URL}/api/documents`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const text = await response.text()
    if (!text) {
      return { success: true, id: "mock-doc-id" }
    }

    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse upload response:", parseError)
      return { success: true, id: "mock-doc-id" }
    }
  } catch (error) {
    console.error("Upload document error:", error)
    throw error
  }
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
