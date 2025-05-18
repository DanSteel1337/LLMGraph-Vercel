"use client"

/**
 * Unified API Client
 *
 * This file serves as the single source of truth for all API calls.
 * All components should use these methods instead of direct fetch calls.
 */

// Types
export interface ApiResponse<T> {
  data: T
  error?: string
  metadata?: Record<string, any>
}

// Options for API requests
export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean
}

// Base API URL
const API_BASE = "/api"

// Error handling
const handleApiError = (error: unknown): string => {
  console.error("API Error:", error)
  if (error instanceof Error) return error.message
  return "An unknown error occurred"
}

// Enhanced fetch function that handles HTML responses and authentication issues
export async function apiFetch<T>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  try {
    // Check if we're on the login page or similar unauthenticated context
    const isLoginPage =
      typeof window !== "undefined" && (window.location.pathname === "/login" || window.location.pathname === "/signup")

    // If we're on login page and this endpoint requires auth, return mock data
    if (isLoginPage && options.requiresAuth) {
      console.log(`Skipping authenticated API call to ${url} on login page`)
      return {
        data: {} as T,
        error: "Not authenticated - mock response",
        metadata: { isMockData: true },
      }
    }

    // Add cache-busting parameter to prevent caching issues
    const separator = url.includes("?") ? "&" : "?"
    const urlWithCache = `${url}${separator}_=${Date.now()}`

    // Set default headers
    const headers = new Headers(options.headers)
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json")
    }
    if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", "no-cache")
    }

    // Make the request
    const response = await fetch(`${API_BASE}${urlWithCache}`, {
      ...options,
      headers,
      // Don't automatically follow redirects
      redirect: "manual",
    })

    // Check for redirects (likely auth issues)
    if (response.type === "opaqueredirect" || [301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("Location")
      if (location?.includes("/login")) {
        return {
          data: {} as T,
          error: "Authentication required",
          metadata: {
            redirectUrl: location,
            status: response.status,
            requiresAuth: true,
          },
        }
      }
    }

    // Check if response is HTML instead of JSON
    const contentType = response.headers.get("content-type") || ""
    if (contentType.includes("text/html")) {
      // Get a preview of the HTML for debugging
      const htmlPreview = await response.text()
      const preview = htmlPreview.substring(0, 100) + "..."

      console.error(`API returned HTML instead of JSON: ${preview}`)

      return {
        data: {} as T,
        error: `API returned HTML instead of JSON. Status: ${response.status}`,
        metadata: {
          status: response.status,
          contentType,
          htmlPreview: preview,
        },
      }
    }

    // Handle non-OK responses
    if (!response.ok) {
      // Try to parse error as JSON if possible
      try {
        const errorData = await response.json()
        return {
          data: {} as T,
          error: errorData.error || `API error: ${response.status} ${response.statusText}`,
          metadata: {
            status: response.status,
            ...errorData,
          },
        }
      } catch (e) {
        // If error isn't JSON, return text
        const errorText = await response.text()
        return {
          data: {} as T,
          error: `API error (${response.status}): ${errorText.substring(0, 100)}`,
          metadata: { status: response.status },
        }
      }
    }

    // Parse successful JSON response
    try {
      const jsonData = await response.json()

      // Standardize the response format
      return {
        data: jsonData.documents || jsonData.feedback || jsonData.results || jsonData.data || jsonData,
        error: jsonData.error,
        metadata: jsonData.metadata || {},
      }
    } catch (e) {
      console.error("Failed to parse JSON response:", e)
      return {
        data: {} as T,
        error: "Invalid JSON response",
        metadata: { parseError: (e as Error).message },
      }
    }
  } catch (error) {
    console.error(`API request to ${url} failed:`, error)
    return {
      data: {} as T,
      error: error instanceof Error ? error.message : String(error),
      metadata: { isNetworkError: true },
    }
  }
}

// Documents API
export const documentsApi = {
  getAll: () => apiFetch<any[]>("/documents"),
  getById: (id: string) => apiFetch<any>(`/documents?id=${id}`),
  create: (data: any) =>
    apiFetch("/documents", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  update: (id: string, data: any) =>
    apiFetch(`/documents?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  delete: (id: string) =>
    apiFetch(`/documents?id=${id}`, {
      method: "DELETE",
    }),
}

// Search API
export const searchApi = {
  search: (query: string, filters?: any) =>
    apiFetch("/search", {
      method: "POST",
      body: JSON.stringify({ query, filters }),
      headers: { "Content-Type": "application/json" },
    }),
  getPopularSearches: () => apiFetch<any[]>("/search?type=popular"),
  getSearchTrends: () => apiFetch<any[]>("/search?type=trends"),
}

// Feedback API
export const feedbackApi = {
  getAll: () => apiFetch<any[]>("/feedback"),
  getById: (id: string) => apiFetch<any>(`/feedback?id=${id}&type=single`),
  create: (data: any) =>
    apiFetch("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  update: (id: string, data: any) =>
    apiFetch(`/feedback?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  delete: (id: string) =>
    apiFetch(`/feedback?id=${id}`, {
      method: "DELETE",
    }),
}

// System API
export const systemApi = {
  getStatus: () => apiFetch<any>("/system?type=health"),
  getHealth: () => apiFetch<any>("/system?type=health"),
  getAnalytics: () => apiFetch<any>("/system?type=stats"),
}

// Settings API
export const settingsApi = {
  getSettings: () => apiFetch<any>("/settings"),
  updateSettings: (data: any) =>
    apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
}

// Analytics API
export const analyticsApi = {
  getCategoryDistribution: () => apiFetch<any[]>("/analytics/category-distribution"),
  getSearchTrends: () => apiFetch<any[]>("/search?type=trends"),
  getPopularSearches: () => apiFetch<any[]>("/search?type=popular"),
}

// Create the client object with all APIs and HTTP method helpers
const client = {
  documents: documentsApi,
  search: searchApi,
  feedback: feedbackApi,
  system: systemApi,
  settings: settingsApi,
  analytics: analyticsApi,

  // Add HTTP method helpers
  get: async (url: string, options?: ApiRequestOptions): Promise<ApiResponse<any>> => {
    return await apiFetch<any>(url, {
      ...options,
      method: "GET",
    })
  },

  post: async (url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<any>> => {
    return await apiFetch<any>(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    })
  },

  put: async (url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<any>> => {
    return await apiFetch<any>(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    })
  },

  delete: async (url: string, options?: ApiRequestOptions): Promise<ApiResponse<any>> => {
    return await apiFetch<any>(url, {
      ...options,
      method: "DELETE",
    })
  },
}

// Export as both named export and default export
export const apiClient = client
export default client

// Typed API functions
export async function fetchData<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
  const response = await apiFetch<T>(endpoint, options)

  if (response.error) {
    // You can handle specific error cases here
    console.warn(`API error from ${endpoint}:`, response.error)

    // If this is mock data from login page, don't throw
    if (response.metadata?.isMockData) {
      return response.data
    }

    throw new Error(response.error)
  }

  return response.data
}
