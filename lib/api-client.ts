"use client"

import { logError } from "@/lib/error-handler"

/**
 * API response interface
 */
export interface ApiResponse<T> {
  data: T
  error?: string
  metadata?: Record<string, any>
}

/**
 * API request options interface
 */
export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean
}

// Base API URL - never modify this
const API_BASE = "/api"

/**
 * List of valid API endpoints
 */
const VALID_API_ENDPOINTS = [
  "/api/documents",
  "/api/search",
  "/api/feedback",
  "/api/system",
  "/api/test-db-connection",
  "/api/analytics",
  "/api/settings",
  // Add more endpoints as they are created
]

/**
 * Validates if an API endpoint exists
 * @param endpoint The API endpoint to validate
 * @returns True if the endpoint exists, false otherwise
 */
function validateApiEndpoint(endpoint: string): boolean {
  // Extract the base endpoint without query parameters
  const baseEndpoint = endpoint.split("?")[0]

  // Check if the endpoint is in the list of valid endpoints
  return VALID_API_ENDPOINTS.some(
    (validEndpoint) => baseEndpoint === validEndpoint || baseEndpoint.startsWith(`${validEndpoint}/`),
  )
}

/**
 * Normalizes an API path to prevent double slashes
 * @param path The API path to normalize
 * @returns The normalized API path
 */
function normalizeApiPath(path: string): string {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  // Ensure no double slashes
  return normalizedPath.replace(/\/+/g, "/")
}

/**
 * Enhanced fetch function that handles common API response patterns
 * @param path API path
 * @param options Request options
 * @returns API response
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  try {
    // Normalize URL to prevent double /api/ prefix
    const normalizedPath = normalizeApiPath(path)

    // Add cache-busting parameter to prevent caching issues
    const separator = normalizedPath.includes("?") ? "&" : "?"
    const urlWithCache = `${normalizedPath}${separator}_=${Date.now()}`

    // Set default headers
    const headers = new Headers(options.headers)
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json")
    }
    if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", "no-cache")
    }

    // Make the request
    const response = await fetch(`${API_BASE}/${urlWithCache}`, {
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

      logError(new Error(`API returned HTML instead of JSON: ${preview}`), "api_html_response_error")

      return {
        data: Array.isArray({} as T) ? ([] as unknown as T) : ({} as T),
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
          data: Array.isArray({} as T) ? ([] as unknown as T) : ({} as T),
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
          data: Array.isArray({} as T) ? ([] as unknown as T) : ({} as T),
          error: `API error (${response.status}): ${errorText.substring(0, 100)}`,
          metadata: { status: response.status },
        }
      }
    }

    // Parse successful JSON response
    try {
      const jsonData = await response.json()

      // Standardize the response format
      const responseData =
        jsonData.documents ||
        jsonData.categories ||
        jsonData.trends ||
        jsonData.popularSearches ||
        jsonData.feedback ||
        jsonData.results ||
        jsonData.data ||
        jsonData

      // Ensure arrays are returned when expected
      if (Array.isArray({} as T) && !Array.isArray(responseData)) {
        return {
          data: (responseData ? [responseData] : []) as unknown as T,
          error: jsonData.error,
          metadata: jsonData.metadata || {},
        }
      }

      return {
        data: responseData as T,
        error: jsonData.error,
        metadata: jsonData.metadata || {},
      }
    } catch (e) {
      logError(e, "api_json_parse_error")
      return {
        data: Array.isArray({} as T) ? ([] as unknown as T) : ({} as T),
        error: "Invalid JSON response",
        metadata: { parseError: (e as Error).message },
      }
    }
  } catch (error) {
    logError(error, "api_request_error")
    return {
      data: Array.isArray({} as T) ? ([] as unknown as T) : ({} as T),
      error: error instanceof Error ? error.message : String(error),
      metadata: { isNetworkError: true },
    }
  }
}

/**
 * Safe fetch wrapper that validates endpoints before making requests
 * @param endpoint The API endpoint to fetch
 * @param options Fetch options
 * @returns Fetch response
 */
export async function safeFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  // Normalize the endpoint
  const normalizedEndpoint = normalizeApiPath(endpoint)

  // Validate the endpoint
  if (!validateApiEndpoint(normalizedEndpoint)) {
    console.error(`Attempting to fetch nonexistent API endpoint: ${normalizedEndpoint}`)
    throw new Error(`API endpoint does not exist: ${normalizedEndpoint}`)
  }

  // Make the fetch request
  const response = await fetch(normalizedEndpoint, options)

  // Check if the response is OK
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error (${response.status}): ${errorText}`)
  }

  return response
}

/**
 * Safe JSON fetch wrapper that validates endpoints and handles JSON parsing
 * @param endpoint The API endpoint to fetch
 * @param options Fetch options
 * @returns Parsed JSON response
 */
export async function safeJsonFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await safeFetch(endpoint, options)
  return (await response.json()) as T
}

// Documents API
export const documentsApi = {
  getAll: () => apiFetch<any[]>("documents"),
  getById: (id: string) => apiFetch<any>(`documents?id=${id}`),
  create: (data: any) =>
    apiFetch("documents", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  update: (id: string, data: any) =>
    apiFetch(`documents?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  delete: (id: string) =>
    apiFetch(`documents?id=${id}`, {
      method: "DELETE",
    }),
}

// Search API
export const searchApi = {
  search: (query: string, filters?: any) =>
    apiFetch("search", {
      method: "POST",
      body: JSON.stringify({ query, filters }),
      headers: { "Content-Type": "application/json" },
    }),
  getPopularSearches: () => apiFetch<any[]>("search?type=popular"),
  getSearchTrends: () => apiFetch<any[]>("search?type=trends"),
}

// Feedback API
export const feedbackApi = {
  getAll: () => apiFetch<any[]>("feedback"),
  getById: (id: string) => apiFetch<any>(`feedback?id=${id}&type=single`),
  create: (data: any) =>
    apiFetch("feedback", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  update: (id: string, data: any) =>
    apiFetch(`feedback?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
  delete: (id: string) =>
    apiFetch(`feedback?id=${id}`, {
      method: "DELETE",
    }),
}

// System API
export const systemApi = {
  getStatus: () => apiFetch<any>("system?type=health"),
  getHealth: () => apiFetch<any>("system?type=health"),
  getAnalytics: () => apiFetch<any>("system?type=stats"),
  testDbConnection: () => apiFetch<any>("test-db-connection"),
}

// Settings API
export const settingsApi = {
  getSettings: () => apiFetch<any>("settings"),
  updateSettings: (data: any) =>
    apiFetch("settings", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }),
}

// Analytics API
export const analyticsApi = {
  getCategoryDistribution: () => apiFetch<any[]>("analytics/category-distribution"),
  getSearchTrends: (period?: string) =>
    apiFetch<any[]>(period ? `analytics/search-trends?period=${period}` : "analytics/search-trends"),
  getPopularSearches: () => apiFetch<any[]>("search?type=popular"),
}

// Create the client object with all APIs and HTTP method helpers
const client = {
  documents: documentsApi,
  search: searchApi,
  feedback: feedbackApi,
  system: systemApi,
  settings: settingsApi,
  analytics: analyticsApi,

  // HTTP method helpers
  get: <T,>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<T>(path, {
      ...options,
      method: "GET",
    }),

  post: <T,>(path: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<T>(path, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),

  put: <T,>(path: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<T>(path, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),

  delete: <T,>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> =>
    apiFetch<T>(path, {
      ...options,
      method: "DELETE",
    }),
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
