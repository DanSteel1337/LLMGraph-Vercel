/**
 * Unified API Client
 *
 * This file serves as the single source of truth for all API calls.
 * All components should use these methods instead of direct fetch calls.
 */

"use client"
import { shouldUseMockData } from "./environment"

// Types
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  isMockData?: boolean
}

/**
 * API Client class for making HTTP requests to the application's API endpoints
 */
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  // Generic fetch wrapper with error handling
  async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error: ${response.status} ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data as T,
        isMockData: data.isMockData || false,
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleApiError(error),
      }
    }
  }

  async fetchApiFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Error: ${response.status} ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data as T,
        isMockData: data.isMockData || false,
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleApiError(error),
      }
    }
  }

  // Error handling
  private handleApiError(error: unknown): string {
    console.error("API Error:", error)
    if (error instanceof Error) return error.message
    return "An unknown error occurred"
  }

  // Documents API
  documents = {
    getAll: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: [], isMockData: true }
      }
      return this.fetchApi("/documents")
    },
    getById: async (id: string) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi(`/documents?id=${id}&type=document`)
    },
    create: async (data: any) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/documents", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
    delete: async (id: string) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi(`/documents?id=${id}`, {
        method: "DELETE",
      })
    },
    update: async (id: string, data: any) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi(`/documents?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },
  }

  // Search API
  search = {
    search: async (query: string, filters?: any) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/search", {
        method: "POST",
        body: JSON.stringify({ query, filters }),
      })
    },
    getPopular: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: [], isMockData: true }
      }
      return this.fetchApi("/search?type=popular")
    },
    getTrends: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: [], isMockData: true }
      }
      return this.fetchApi("/search?type=trends")
    },
    getCategories: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: [], isMockData: true }
      }
      return this.fetchApi("/api/analytics?type=category-distribution")
    },
    getVersions: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: [], isMockData: true }
      }
      return { success: true, data: ["UE 5.3", "UE 5.2", "UE 5.1", "UE 5.0", "UE 4.27"], isMockData: true }
    },
  }

  // Feedback API
  feedback = {
    getAll: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: [], isMockData: true }
      }
      return this.fetchApi("/feedback")
    },
    getById: async (id: string) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi(`/feedback?id=${id}`)
    },
    create: async (data: any) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
    delete: async (id: string) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi(`/feedback?id=${id}`, {
        method: "DELETE",
      })
    },
    update: async (id: string, data: any) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi(`/feedback?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },
  }

  // System API
  system = {
    getStatus: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/system?type=health")
    },
    getHealth: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/system?type=health")
    },
    getAnalytics: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/system?type=analytics")
    },
  }

  // Settings API
  settings = {
    getSettings: async () => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/settings")
    },
    updateSettings: async (data: any) => {
      if (shouldUseMockData()) {
        return { success: true, data: {}, isMockData: true }
      }
      return this.fetchApi("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },
  }

  postFormData = async <T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    if (shouldUseMockData()) {
      return { success: true, data: {} as T, isMockData: true }
    }
    return this.fetchApiFormData(endpoint, formData)
  }
}

// Create a singleton instance
export const apiClient = new ApiClient()

// For backward compatibility with default imports
export default apiClient
