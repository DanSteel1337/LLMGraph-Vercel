/**
 * Environment Detection Module
 *
 * Provides utilities for detecting the current runtime environment (development, preview, production)
 * and determining environment-specific behaviors like whether to use mock data.
 *
 * @module environment
 */

// Production domain from the project settings
const PRODUCTION_DOMAIN = "www.vector-rag.com"

/**
 * Gets the current Vercel environment
 * @returns The current Vercel environment (production, preview, development)
 */
export function getVercelEnv(): "production" | "preview" | "development" {
  // For server-side, use VERCEL_ENV directly
  if (typeof window === "undefined") {
    return (process.env.VERCEL_ENV as "production" | "preview" | "development") || "development"
  }

  // For client-side, infer from hostname
  const hostname = window.location.hostname
  if (hostname.includes(PRODUCTION_DOMAIN)) {
    return "production"
  } else if (hostname.includes("vercel.app") || hostname.includes("localhost")) {
    return "preview"
  }

  // Default to development for any other case
  return "development"
}

/**
 * Detects if the current environment is a development environment
 */
export function isDevelopment(): boolean {
  if (typeof window === "undefined") {
    // Server-side: check both NODE_ENV and VERCEL_ENV
    return process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "development"
  }

  // Client-side: infer from hostname
  return window.location.hostname === "localhost"
}

/**
 * Detects if the current environment is a preview deployment
 */
export function isPreviewDeployment(): boolean {
  if (typeof window === "undefined") {
    // Server-side: check for Vercel preview environment variable
    return process.env.VERCEL_ENV === "preview"
  }

  // Client-side: check the hostname
  const hostname = window.location.hostname
  return hostname.includes("vercel.app") || (hostname !== "localhost" && !hostname.includes(PRODUCTION_DOMAIN))
}

/**
 * Detects if the current environment is the production environment
 */
export function isProduction(): boolean {
  if (typeof window === "undefined") {
    // Server-side: check for Vercel production environment variable
    return process.env.VERCEL_ENV === "production"
  }

  // Client-side: check if we're on the production domain
  return window.location.hostname.includes(PRODUCTION_DOMAIN)
}

/**
 * Determines whether to use mock data based on the current environment
 * Mock data is used in development and preview environments, but not in production
 */
export function shouldUseMockData(): boolean {
  return getVercelEnv() !== "production"
}

/**
 * Gets the appropriate API endpoint based on the environment
 */
export function getApiEndpoint(path = ""): string {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  // In browser context, use relative path
  if (typeof window !== "undefined") {
    return `/api${normalizedPath}`
  }

  // In server context, construct full URL if needed
  return `/api${normalizedPath}`
}
