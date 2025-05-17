/**
 * Unified API Client
 *
 * This file serves as the single source of truth for all API calls.
 * All components should use these methods instead of direct fetch calls.
 */

// Types
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
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
