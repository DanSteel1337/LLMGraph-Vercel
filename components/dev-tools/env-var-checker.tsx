"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EnvVarChecker() {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [isMockData, setIsMockData] = useState(false)

  const checkEnvVars = async () => {
    setChecking(true)
    setIsMockData(false)

    try {
      const response = await apiClient.get("/api/test-db-connection")

      // Check if the response contains mock data
      if (response.isMockData) {
        setIsMockData(true)
      }

      setResults(response.data)
    } catch (error) {
      console.error("Error checking environment variables:", error)
      setResults({ error: String(error) })
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
            {isMockData && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Showing mock diagnostic data. Connect to a real database in production.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1">
              <div className="text-sm font-medium">Connection Test</div>
              <div className="flex items-center text-sm">
                {results.connectionTest.success ? (
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="mr-1 h-4 w-4 text-red-500" />
                )}
                {results.connectionTest.message}
              </div>
              {results.connectionTest.error && (
                <div className="text-xs text-red-500">{results.connectionTest.error}</div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Environment Variables</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>Supabase URL:</div>
                <div
                  className={results.environmentVariables.supabaseUrl.includes("✓") ? "text-green-500" : "text-red-500"}
                >
                  {results.environmentVariables.supabaseUrl}
                </div>
                <div>Supabase Key:</div>
                <div
                  className={results.environmentVariables.supabaseKey.includes("✓") ? "text-green-500" : "text-red-500"}
                >
                  {results.environmentVariables.supabaseKey}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Tables</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(results.tablesTest).map(([table, info]: [string, any]) => (
                  <>
                    <div key={`${table}-name`}>{table}:</div>
                    <div key={`${table}-status`} className={info.exists ? "text-green-500" : "text-red-500"}>
                      {info.exists ? "✓ Exists" : "✗ Not found"}
                    </div>
                    {info.error && (
                      <div key={`${table}-error`} className="col-span-2 text-red-500">
                        Error: {info.error}
                      </div>
                    )}
                  </>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
