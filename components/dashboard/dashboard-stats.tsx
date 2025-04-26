"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Search, MessageSquare, Database } from "lucide-react"
import { fetchStats } from "@/lib/api"

interface StatsData {
  totalDocuments: number
  totalSearches: number
  totalFeedback: number
  vectorCount: number
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
          setStats(null)
          setError("Received invalid data format")
        } else {
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setStats(null)
        setError("Failed to load statistics")
      } finally {
        setIsLoading(false)
      }
    }

    getStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Documents"
        value={stats?.totalDocuments}
        description="Documents in the system"
        icon={FileText}
        isLoading={isLoading}
        error={error}
      />
      <StatsCard
        title="Vector Count"
        value={stats?.vectorCount}
        description="Vectors in Pinecone"
        icon={Database}
        isLoading={isLoading}
        error={error}
      />
      <StatsCard
        title="Total Searches"
        value={stats?.totalSearches}
        description="Search queries performed"
        icon={Search}
        isLoading={isLoading}
        error={error}
      />
      <StatsCard
        title="Feedback Items"
        value={stats?.totalFeedback}
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
          <div className="h-7 w-16 animate-pulse rounded-md bg-muted"></div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">Using mock data</div>
        ) : value !== undefined ? (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
