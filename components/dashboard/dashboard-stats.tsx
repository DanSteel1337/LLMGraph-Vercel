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
  isLoading: boolean
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalDocuments: 0,
    totalSearches: 0,
    totalFeedback: 0,
    vectorCount: 0,
    isLoading: true,
  })

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchStats()
        setStats({
          ...data,
          isLoading: false,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Set default values if API call fails
        setStats({
          totalDocuments: 0,
          totalSearches: 0,
          totalFeedback: 0,
          vectorCount: 0,
          isLoading: false,
        })

        // Show a more user-friendly message in the UI instead of failing completely
        // We'll handle this in the component rendering
      }
    }

    getStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Documents"
        value={stats.totalDocuments}
        description="Documents in the system"
        icon={FileText}
        isLoading={stats.isLoading}
      />
      <StatsCard
        title="Vector Count"
        value={stats.vectorCount}
        description="Vectors in Pinecone"
        icon={Database}
        isLoading={stats.isLoading}
      />
      <StatsCard
        title="Total Searches"
        value={stats.totalSearches}
        description="Search queries performed"
        icon={Search}
        isLoading={stats.isLoading}
      />
      <StatsCard
        title="Feedback Items"
        value={stats.totalFeedback}
        description="User feedback collected"
        icon={MessageSquare}
        isLoading={stats.isLoading}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  description: string
  icon: React.ElementType
  isLoading: boolean
}

function StatsCard({ title, value, description, icon: Icon, isLoading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-7 w-16 animate-pulse rounded-md bg-muted"></div>
        ) : value !== undefined ? (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        ) : (
          <div className="text-sm text-muted-foreground">Unable to load data</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
