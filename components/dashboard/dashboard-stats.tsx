"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, MessageSquare, Database, RefreshCw } from "lucide-react"
import { fetchStats } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface StatsData {
  totalDocuments: number
  totalSearches: number
  totalFeedback: number
  vectorCount: number
  dimensions?: number
  indexName?: string
  isError?: boolean
  errorMessage?: string
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const getStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchStats()

        // Check if the data has an error flag
        if (data?.isError) {
          setError(data.errorMessage || "Failed to fetch stats")
          setStats(data) // Still set the stats to show fallback values
        } else {
          // Validate the data structure
          if (!data || typeof data !== "object") {
            console.error("Invalid data format for stats:", data)
            setError("Failed to fetch stats: Invalid data format")
          } else {
            setStats(data)
          }
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setError("Failed to fetch stats: " + (error instanceof Error ? error.message : String(error)))
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Documents"
          value={stats?.totalDocuments}
          description="Total documents indexed"
          icon={FileText}
          isLoading={isLoading}
          error={error}
        />
        <StatsCard
          title="Vector Embeddings"
          value={stats?.vectorCount}
          description={`Vectors in ${stats?.indexName || "Pinecone"}`}
          icon={Database}
          isLoading={isLoading}
          error={error}
        />
        <StatsCard
          title="Searches"
          value={stats?.totalSearches}
          description="Total search queries"
          icon={Search}
          isLoading={isLoading}
          error={error}
        />
        <StatsCard
          title="Feedback"
          value={stats?.totalFeedback}
          description="User feedback collected"
          icon={MessageSquare}
          isLoading={isLoading}
          error={error}
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
