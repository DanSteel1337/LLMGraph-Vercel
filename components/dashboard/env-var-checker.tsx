"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function EnvVarChecker() {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<any>(null)

  const checkEnvVars = async () => {
    setChecking(true)
    try {
      const response = await fetch("/api/test-db-connection")

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        setResults(data)
      } else {
        // Handle non-JSON responses
        const text = await response.text()
        setResults({
          success: false,
          error: `Invalid response format: ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}`,
        })
      }
    } catch (error) {
      console.error("Error checking environment variables:", error)
      setResults({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Database Connection Diagnostics</CardTitle>
        <Button variant="outline" size="sm" onClick={checkEnvVars} disabled={checking} className="h-8 px-2 lg:px-3">
          {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Run Diagnostics"}
        </Button>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-sm text-muted-foreground">Click the button to check database connection</div>
        ) : results.error ? (
          <div className="text-sm text-red-500">{results.error}</div>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Connection Test</div>
              <div className="flex items-center text-sm">
                {results.success ? (
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="mr-1 h-4 w-4 text-red-500" />
                )}
                {results.message}
              </div>
              {results.error && <div className="text-xs text-red-500">{results.error}</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
