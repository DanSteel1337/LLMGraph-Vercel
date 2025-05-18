"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ErrorBoundary from "@/components/ui/error-boundary"
import { apiClient } from "@/lib/api-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function DatabaseDiagnostics() {
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking")
  const [pineconeStatus, setPineconeStatus] = useState<"checking" | "connected" | "error">("checking")
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const [pineconeError, setPineconeError] = useState<string | null>(null)
  const [supabaseDetails, setSupabaseDetails] = useState<any>(null)
  const [pineconeDetails, setPineconeDetails] = useState<any>(null)
  const [supabaseMockData, setSupabaseMockData] = useState(false)
  const [pineconeMockData, setPineconeMockData] = useState(false)

  const checkSupabase = async () => {
    setSupabaseStatus("checking")
    setSupabaseError(null)
    setSupabaseMockData(false)

    try {
      const response = await apiClient.get("/api/diagnostics/supabase")

      // Check if the response contains mock data
      if (response.isMockData) {
        setSupabaseMockData(true)
      }

      if (response.data.success) {
        setSupabaseStatus("connected")
        setSupabaseDetails(response.data.details)
      } else {
        setSupabaseStatus("error")
        setSupabaseError(response.data.error)
      }
    } catch (error) {
      setSupabaseStatus("error")
      setSupabaseError(error instanceof Error ? error.message : "Unknown error")
    }
  }

  const checkPinecone = async () => {
    setPineconeStatus("checking")
    setPineconeError(null)
    setPineconeMockData(false)

    try {
      const response = await apiClient.get("/api/diagnostics/pinecone")

      // Check if the response contains mock data
      if (response.isMockData) {
        setPineconeMockData(true)
      }

      if (response.data.success) {
        setPineconeStatus("connected")
        setPineconeDetails(response.data.details)
      } else {
        setPineconeStatus("error")
        setPineconeError(response.data.error)
      }
    } catch (error) {
      setPineconeStatus("error")
      setPineconeError(error instanceof Error ? error.message : "Unknown error")
    }
  }

  useEffect(() => {
    checkSupabase()
    checkPinecone()
  }, [])

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Database Diagnostics</CardTitle>
          <CardDescription>Check the connection status of database services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="supabase">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
              <TabsTrigger value="pinecone">Pinecone</TabsTrigger>
            </TabsList>

            <TabsContent value="supabase">
              <div className="space-y-4">
                {supabaseMockData && (
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Preview Mode</AlertTitle>
                    <AlertDescription>
                      You are viewing mock diagnostic data. Connect to a real database in production.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`mr-2 h-3 w-3 rounded-full ${
                        supabaseStatus === "connected"
                          ? "bg-green-500"
                          : supabaseStatus === "error"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    ></div>
                    <span>
                      {supabaseStatus === "connected"
                        ? "Connected"
                        : supabaseStatus === "error"
                          ? "Connection Error"
                          : "Checking..."}
                    </span>
                  </div>
                  <Button size="sm" onClick={checkSupabase}>
                    Refresh
                  </Button>
                </div>

                {supabaseError && (
                  <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                    <p>Error: {supabaseError}</p>
                  </div>
                )}

                {supabaseDetails && (
                  <div className="rounded-md bg-gray-50 p-4 text-sm">
                    <h3 className="mb-2 font-medium">Connection Details</h3>
                    <pre className="overflow-auto text-xs">{JSON.stringify(supabaseDetails, null, 2)}</pre>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pinecone">
              <div className="space-y-4">
                {pineconeMockData && (
                  <Alert variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Preview Mode</AlertTitle>
                    <AlertDescription>
                      You are viewing mock diagnostic data. Connect to a real vector database in production.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`mr-2 h-3 w-3 rounded-full ${
                        pineconeStatus === "connected"
                          ? "bg-green-500"
                          : pineconeStatus === "error"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }`}
                    ></div>
                    <span>
                      {pineconeStatus === "connected"
                        ? "Connected"
                        : pineconeStatus === "error"
                          ? "Connection Error"
                          : "Checking..."}
                    </span>
                  </div>
                  <Button size="sm" onClick={checkPinecone}>
                    Refresh
                  </Button>
                </div>

                {pineconeError && (
                  <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                    <p>Error: {pineconeError}</p>
                  </div>
                )}

                {pineconeDetails && (
                  <div className="rounded-md bg-gray-50 p-4 text-sm">
                    <h3 className="mb-2 font-medium">Connection Details</h3>
                    <pre className="overflow-auto text-xs">{JSON.stringify(pineconeDetails, null, 2)}</pre>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
