"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, MessageSquare, Database, TrendingUp, TrendingDown } from "lucide-react"
import { fetchStats } from "@/lib/api"

interface StatsData {
  totalDocuments: number
  totalSearches: number
  totalFeedback: number
  vectorCount: number
  documentChange?: number
  searchChange?: number
  feedbackChange?: number
  vectorChange?: number
}

// Mock data with change percentages
const MOCK_DATA: StatsData = {
  totalDocuments: 156,
  totalSearches: 2489,
  totalFeedback: 73,
  vectorCount: 4218,
  documentChange: 12,
  searchChange: 24,
  feedbackChange: 8,
  vectorChange: 15,
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchStats()

        // Validate the data structure
        if (!data || typeof data !== "object") {
          console.error("Invalid data format for stats:", data)
          setStats(MOCK_DATA)
          setError("Using mock data (invalid format)")
        } else {
          // Add mock change percentages if they don't exist
          if (!data.documentChange) data.documentChange = MOCK_DATA.documentChange
          if (!data.searchChange) data.searchChange = MOCK_DATA.searchChange
          if (!data.feedbackChange) data.feedbackChange = MOCK_DATA.feedbackChange
          if (!data.vectorChange) data.vectorChange = MOCK_DATA.vectorChange

          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setStats(MOCK_DATA)
        setError("Using mock data (fetch error)")
      } finally {
        setIsLoading(false)
      }
    }

    getStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Documents"
        value={stats?.totalDocuments}
        change={stats?.documentChange}
        description="Total documents indexed"
        icon={FileText}
        isLoading={isLoading}
        error={error}
      />
      <StatsCard
        title="Vector Embeddings"
        value={stats?.vectorCount}
        change={stats?.vectorChange}
        description="Total vectors in Pinecone"
        icon={Database}
        isLoading={isLoading}
        error={error}
      />
      <StatsCard
        title="Searches"
        value={stats?.totalSearches}
        change={stats?.searchChange}
        description="Total search queries"
        icon={Search}
        isLoading={isLoading}
        error={error}
      />
      <StatsCard
        title="Feedback"
        value={stats?.totalFeedback}
        change={stats?.feedbackChange}
        description="User feedback collected"
        icon={MessageSquare}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value?: number
  change?: number
  description: string
  icon: React.ElementType
  isLoading: boolean
  error: string | null
}

function StatsCard({ title, value, change, description, icon: Icon, isLoading, error }: StatsCardProps) {
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
            <div className="text-2xl font-bold">{value?.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        ) : value !== undefined ? (
          <div className="space-y-1">
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {change >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{change}% increase</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{Math.abs(change)}% decrease</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  )
}
