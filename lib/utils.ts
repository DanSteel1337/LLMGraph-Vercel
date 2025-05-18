/**
 * General Utilities Module
 *
 * Provides common utility functions for string manipulation, formatting,
 * data validation, and other general-purpose operations used throughout
 * the application.
 *
 * @module utils
 */

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

/**
 * Formats a date to a readable string
 * @param date - Date object or date string to format
 * @param fallback - Optional fallback string to return if date is invalid (defaults to 'Invalid Date')
 * @returns Formatted date string or fallback value
 */
export function formatDate(date: Date | string | null | undefined, fallback = "Invalid Date"): string {
  if (date === null || date === undefined) {
    return fallback
  }

  try {
    const d = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(d.getTime())) {
      return fallback
    }

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return fallback
  }
}

/**
 * Truncates text to a specified length
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

/**
 * Checks if the environment is a browser
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/**
 * Checks if the environment is a server
 */
export function isServer(): boolean {
  return typeof window === "undefined"
}

/**
 * Checks if required environment variables are present
 */
export function checkRequiredEnvVars(requiredVars: string[]): {
  allPresent: boolean
  missingVars: string[]
} {
  if (typeof process === "undefined" || !process.env) {
    return { allPresent: false, missingVars: ["process.env not available"] }
  }

  const missingVars = requiredVars.filter((varName) => !process.env[varName])
  return {
    allPresent: missingVars.length === 0,
    missingVars,
  }
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return fallback
  }
}

/**
 * Generates a random ID
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>): void => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Formats a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

/**
 * Formats bytes to a human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Formats a percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}
