import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SystemStatus from "@/components/dashboard/system-status"
import SearchInterface from "@/components/search/search-interface"
import ErrorBoundary from "@/components/ui/error-boundary"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Unreal Engine Documentation</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ErrorBoundary>
          <Suspense fallback={<div>Loading system status...</div>}>
            <SystemStatus />
          </Suspense>
        </ErrorBoundary>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to UE Documentation</CardTitle>
            <CardDescription>Find and search through Unreal Engine documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This application allows you to search through Unreal Engine documentation using natural language queries.
              Our system uses advanced vector search to find the most relevant information for your questions.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <ErrorBoundary>
          <Suspense fallback={<div>Loading search interface...</div>}>
            <SearchInterface />
          </Suspense>
        </ErrorBoundary>
      </div>
    </main>
  )
}
