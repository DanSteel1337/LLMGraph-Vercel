"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ServiceTester() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("pinecone")

  const testService = async (service: string) => {
    setLoading((prev) => ({ ...prev, [service]: true }))

    try {
      console.log(`Testing ${service} service...`)
      const response = await fetch(`/api/test-${service}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`${service} test result:`, data)

      setResults((prev) => ({
        ...prev,
        [service]: {
          success: data.success,
          message: data.message || data.error || "Unknown result",
          details: data,
          timestamp: new Date().toISOString(),
        },
      }))
    } catch (error) {
      console.error(`Error testing ${service}:`, error)
      setResults((prev) => ({
        ...prev,
        [service]: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
          details: { error: String(error) },
          timestamp: new Date().toISOString(),
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [service]: false }))
    }
  }

  const getStatusIcon = (service: string) => {
    if (!results[service]) return null

    return results[service].success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const testAllServices = async () => {
    await testService("pinecone")
    await testService("supabase")
    await testService("openai")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Service Connection Tester</CardTitle>
            <CardDescription>Test individual services to isolate issues</CardDescription>
          </div>
          <Button onClick={testAllServices} disabled={loading.pinecone || loading.supabase || loading.openai}>
            {(loading.pinecone || loading.supabase || loading.openai) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Test All Services
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pinecone" className="flex items-center gap-2">
              Pinecone {getStatusIcon("pinecone")}
            </TabsTrigger>
            <TabsTrigger value="supabase" className="flex items-center gap-2">
              Supabase {getStatusIcon("supabase")}
            </TabsTrigger>
            <TabsTrigger value="openai" className="flex items-center gap-2">
              OpenAI {getStatusIcon("openai")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pinecone" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium">Pinecone Vector Database</h3>
              <Button onClick={() => testService("pinecone")} disabled={loading.pinecone} variant="outline">
                {loading.pinecone && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Test Connection
              </Button>
            </div>

            {results.pinecone ? (
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Status:</span>
                  <span className={results.pinecone.success ? "text-green-600" : "text-red-600"}>
                    {results.pinecone.success ? "Connected" : "Failed"}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Message:</span> {results.pinecone.message}
                </div>
                {results.pinecone.details?.stats && (
                  <div className="mb-2">
                    <span className="font-medium">Vector Count:</span> {results.pinecone.details.stats.vectorCount}
                    <br />
                    <span className="font-medium">Dimensions:</span> {results.pinecone.details.stats.dimensions}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Last tested: {new Date(results.pinecone.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span>No test results yet. Click "Test Connection" to check Pinecone.</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="supabase" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium">Supabase Database</h3>
              <Button onClick={() => testService("supabase")} disabled={loading.supabase} variant="outline">
                {loading.supabase && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Test Connection
              </Button>
            </div>

            {results.supabase ? (
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Status:</span>
                  <span className={results.supabase.success ? "text-green-600" : "text-red-600"}>
                    {results.supabase.success ? "Connected" : "Failed"}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Message:</span> {results.supabase.message}
                </div>
                {results.supabase.details?.data && (
                  <div className="mb-2">
                    <span className="font-medium">Records Found:</span> {results.supabase.details.data.recordCount}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Last tested: {new Date(results.supabase.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span>No test results yet. Click "Test Connection" to check Supabase.</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="openai" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium">OpenAI API</h3>
              <Button onClick={() => testService("openai")} disabled={loading.openai} variant="outline">
                {loading.openai && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Test Connection
              </Button>
            </div>

            {results.openai ? (
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Status:</span>
                  <span className={results.openai.success ? "text-green-600" : "text-red-600"}>
                    {results.openai.success ? "Connected" : "Failed"}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium">Message:</span> {results.openai.message}
                </div>
                {results.openai.details?.embeddingLength && (
                  <div className="mb-2">
                    <span className="font-medium">Embedding Length:</span> {results.openai.details.embeddingLength}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Last tested: {new Date(results.openai.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span>No test results yet. Click "Test Connection" to check OpenAI.</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
