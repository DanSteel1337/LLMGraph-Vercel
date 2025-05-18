/**
 * Unified API Client
 *
 * This file serves as the single source of truth for all API calls.
 * All components should use these methods instead of direct fetch calls.
 */

import { shouldUseMockData } from "@/lib/environment"
import { MOCK_DOCUMENTS, MOCK_POPULAR_SEARCHES, MOCK_SEARCH_TRENDS, MOCK_SYSTEM_STATUS } from "@/lib/mock-data"

// Types
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  isMockData?: boolean
}

// Base API URL
const API_BASE = "/api"

// Error handling
const handleApiError = (error: unknown): string => {
  console.error("API Error:", error)
  if (error instanceof Error) return error.message
  return "An unknown error occurred"
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    // Return mock data based on the endpoint
    if (endpoint === "/documents") {
      return {
        success: true,
        data: MOCK_DOCUMENTS as unknown as T,
        isMockData: true,
      }
    }
    if (endpoint === "/search/popular") {
      return {
        success: true,
        data: MOCK_POPULAR_SEARCHES as unknown as T,
        isMockData: true,
      }
    }
    if (endpoint === "/search/trends") {
      return {
        success: true,
        data: MOCK_SEARCH_TRENDS as unknown as T,
        isMockData: true,
      }
    }
    if (endpoint === "/system/status") {
      return {
        success: true,
        data: MOCK_SYSTEM_STATUS as unknown as T,
        isMockData: true,
      }
    }

    // Default mock response for other endpoints
    return {
      success: true,
      data: {} as T,
      isMockData: true,
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
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
      error: handleApiError(error),
    }
  }
}

// Documents API
export const documentsApi = {
  getAll: () => fetchApi("/documents"),
  getById: (id: string) => fetchApi(`/documents/${id}`),
  create: (data: any) =>
    fetchApi("/documents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/documents/${id}`, {
      method: "DELETE",
    }),
}

// Search API
export const searchApi = {
  search: (query: string, filters?: any) =>
    fetchApi("/search", {
      method: "POST",
      body: JSON.stringify({ query, filters }),
    }),
  getPopularSearches: () => fetchApi("/search/popular"),
  getSearchTrends: () => fetchApi("/search/trends"),
}

// Feedback API
export const feedbackApi = {
  getAll: () => fetchApi("/feedback"),
  getById: (id: string) => fetchApi(`/feedback/${id}`),
  create: (data: any) =>
    fetchApi("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi(`/feedback/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/feedback/${id}`, {
      method: "DELETE",
    }),
}

// System API
export const systemApi = {
  getStatus: () => fetchApi("/system/status"),
  getHealth: () => fetchApi("/system/health"),
  getAnalytics: () => fetchApi("/system/analytics"),
}

// Settings API
export const settingsApi = {
  getSettings: () => fetchApi("/settings"),
  updateSettings: (data: any) =>
    fetchApi("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// Export a default object with all APIs
const apiClient = {
  documents: documentsApi,
  search: searchApi,
  feedback: feedbackApi,
  system: systemApi,
  settings: settingsApi,
}

export default apiClient

// Named exports for individual functions
export const getAllDocuments = documentsApi.getAll
export const getDocumentById = documentsApi.getById
export const createDocument = documentsApi.create
export const updateDocument = documentsApi.update
export const deleteDocument = documentsApi.delete

export const searchDocuments = searchApi.search
export const getPopularSearches = searchApi.getPopularSearches
export const getSearchTrends = searchApi.getSearchTrends

export const getAllFeedback = feedbackApi.getAll
export const getFeedbackById = feedbackApi.getById
export const createFeedback = feedbackApi.create
export const updateFeedback = feedbackApi.update
export const deleteFeedback = feedbackApi.delete

export const getSystemStatus = systemApi.getStatus
export const getSystemHealth = systemApi.getHealth
export const getSystemAnalytics = systemApi.getAnalytics

export const getSettings = settingsApi.getSettings
export const updateSettings = settingsApi.updateSettings

/**
 * Perform a search with the given query and filters
 * @param query Search query
 * @param filters Optional filters
 * @returns Search results
 */
export async function performSearch(query: string, filters?: any) {
  return searchApi.search(query, filters)
}
