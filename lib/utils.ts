import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
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
