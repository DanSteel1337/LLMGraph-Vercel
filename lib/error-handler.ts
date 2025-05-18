/**
 * Error Handling Module
 *
 * Provides utilities for consistent error handling, logging, and formatting
 * across the application. Includes error severity levels and context tracking.
 *
 * @module error-handler
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Error context interface
 */
interface ErrorContext {
  userId?: string
  url?: string
  component?: string
  [key: string]: any
}

/**
 * Logs an error to the console and optionally to a monitoring service
 * @param error The error to log
 * @param errorCode A code identifying the error type
 * @param severity The severity of the error
 * @param context Additional context for the error
 */
export function logError(
  error: unknown,
  errorCode = "unknown_error",
  severity = ErrorSeverity.ERROR,
  context: ErrorContext = {},
) {
  // Extract error message
  const errorMessage = error instanceof Error ? error.message : String(error)

  // Create error object
  const errorObject = {
    code: errorCode,
    message: errorMessage,
    severity,
    timestamp: new Date().toISOString(),
    context: {
      ...context,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    },
    stack: error instanceof Error ? error.stack : undefined,
  }

  // Log to console
  console.error(`[${errorCode}] ${errorMessage}`, errorObject)

  // TODO: Send to error monitoring service in production
  if (process.env.NODE_ENV === "production") {
    // Example: sendToErrorMonitoring(errorObject)
  }

  return errorObject
}

/**
 * Creates a formatted error response for API routes
 * @param error The error to format
 * @param statusCode The HTTP status code
 * @returns Formatted error response
 */
export function createErrorResponse(error: unknown, statusCode = 500) {
  const errorMessage = error instanceof Error ? error.message : String(error)

  return {
    error: errorMessage,
    status: statusCode,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Handles API route errors
 * @param error The error to handle
 * @param errorCode A code identifying the error type
 * @returns Error response
 */
export function handleApiError(error: unknown, errorCode = "api_error") {
  // Log the error
  logError(error, errorCode)

  // Determine status code
  let statusCode = 500

  if (error instanceof Error) {
    if (error.message.includes("not found") || error.message.includes("404")) {
      statusCode = 404
    } else if (error.message.includes("unauthorized") || error.message.includes("401")) {
      statusCode = 401
    } else if (error.message.includes("forbidden") || error.message.includes("403")) {
      statusCode = 403
    } else if (error.message.includes("bad request") || error.message.includes("400")) {
      statusCode = 400
    }
  }

  // Create error response
  return createErrorResponse(error, statusCode)
}

/**
 * Checks if an error is a network-related error
 * @param error The error to check
 * @returns True if the error is network-related, false otherwise
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (error.message.includes("network") || error.message.includes("fetch"))
}
