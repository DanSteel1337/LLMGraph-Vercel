/**
 * Environment Variable Validator Module
 *
 * Provides utilities for validating and accessing environment variables with
 * caching and error handling. Centralizes all environment variable access.
 *
 * @module env-validator
 */

import { shouldUseMockData, isDevelopment, isPreviewDeployment, isProduction } from "./environment"

// Cache validated environment variables
const validatedEnvVars: Record<string, string> = {}

/**
 * Validates and returns an environment variable
 * @param name Environment variable name
 * @param required Whether the variable is required
 * @param defaultValue Default value if not required and not found
 * @returns The environment variable value
 */
export function validateEnvVar(name: string, required = true, defaultValue = ""): string {
  // Special case for USE_MOCK_DATA - use the environment utility instead
  if (name === "USE_MOCK_DATA") {
    return shouldUseMockData() ? "true" : "false"
  }

  // Return cached value if already validated
  if (validatedEnvVars[name]) {
    return validatedEnvVars[name]
  }

  const value = process.env[name] || ""

  if (required && !value) {
    throw new Error(`Environment variable ${name} is not defined`)
  }

  // Use default value if not required and not found
  const finalValue = required || value ? value : defaultValue

  // Cache the validated value
  validatedEnvVars[name] = finalValue

  return finalValue
}

/**
 * Validates and returns a client-side environment variable
 * @param name Environment variable name (without NEXT_PUBLIC_ prefix)
 * @param required Whether the variable is required
 * @param defaultValue Default value if not required and not found
 * @returns The environment variable value
 */
export function validateClientEnvVar(name: string, required = true, defaultValue = ""): string {
  return validateEnvVar(`NEXT_PUBLIC_${name}`, required, defaultValue)
}

/**
 * Gets all validated environment variables
 * @returns Record of validated environment variables
 */
export function getValidatedEnvVars(): Record<string, string> {
  return { ...validatedEnvVars }
}

/**
 * Gets the current environment name
 * @returns The current environment name (development, preview, production)
 */
export function getEnvironmentName(): string {
  if (isDevelopment()) return "development"
  if (isPreviewDeployment()) return "preview"
  if (isProduction()) return "production"
  return "unknown"
}
