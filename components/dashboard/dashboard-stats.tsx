"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, MessageSquare, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { shouldUseMockData } from "@/lib/environment"

interface StatsData {
  totalDocuments: number
  totalSearches: number
  totalFeedback: number
  vectorCount: number
  dimensions?: number
  indexName?: string
}

// Mock data for development and fallback
const MOCK_STATS: StatsData = {
  totalDocuments: 125,
  totalSearches: 1842,
  totalFeedback: 37,
  vectorCount: 3750,
  dimensions: 1536,
  indexName: "unreal-docs",
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const getStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setIsMockData(false)

        // Check if we're on the login page
        const isLoginPage =
          typeof window !== "undefined" &&
          (window.location.pathname === "/login" || window.location.pathname === "/signup")

        // Use mock data if on login page or if we should use mock data based on environment
        if (isLoginPage || shouldUseMockData()) {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500))
          setStats(MOCK_STATS)
          setIsMockData(true)
          return
        }

        // Fetch real data from API
        const response = await apiClient.get<StatsData>("/api/system", {
          params: { type: "stats" },
        })

        if (response.error) {
          throw new Error(response.error)
        }

        setStats(response.data)
        // Check if the response contains mock data flag
        if (response.isMockData) {
          setIsMockData(true)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setError("Failed to fetch stats: " + (error instanceof Error ? error.message : String(error)))

        // Use mock data as fallback
        setStats(MOCK_STATS)
        setIsMockData(true)
      } finally {
        setIsLoading(false)
      }
    }

    getStats()
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Statistics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isMockData && (
        <div className="text-sm text-amber-600 mb-2">Showing mock data{error ? `. Error: ${error}` : ""}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Documents"
          value={stats?.totalDocuments}
          description="Total documents indexed"
          icon={FileText}
          isLoading={isLoading}
          error={error && !isMockData ? error : null}
        />
        <StatsCard
          title="Vector Embeddings"
          value={stats?.vectorCount}
          description={`Vectors in ${stats?.indexName || "Pinecone"}`}
          icon={Database}
          isLoading={isLoading}
          error={error && !isMockData ? error : null}
        />
        <StatsCard
          title="Searches"
          value={stats?.totalSearches}
          description="Total search queries"
          icon={Search}
          isLoading={isLoading}
          error={error && !isMockData ? error : null}
        />
        <StatsCard
          title="Feedback"
          value={stats?.totalFeedback}
          description="User feedback collected"
          icon={MessageSquare}
          isLoading={isLoading}
          error={error && !isMockData ? error : null}
        />
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value?: number
  description: string
  icon: React.ElementType
  isLoading: boolean
  error: string | null
}

function StatsCard({ title, value, description, icon: Icon, isLoading, error }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-7 w-16 animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
          </div>
        ) : error ? (
          <div className="space-y-1">
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground">{description}</div>
            <div className="text-xs text-red-500 mt-1">Error loading data</div>
          </div>
        ) : value !== undefined ? (
          <div className="space-y-1">
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  )
}
