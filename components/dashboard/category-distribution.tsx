"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { AlertCircle } from "lucide-react"

// Define the data structure
type CategoryData = {
  name: string
  value: number
  color: string
}

// Colors for the chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#A4DE6C"]

export function CategoryDistribution() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if we should use mock data
        const useMockData = process.env.USE_MOCK_DATA === "true"

        if (useMockData) {
          // Use mock data
          const mockData: CategoryData[] = [
            { name: "Blueprints", value: 35, color: COLORS[0] },
            { name: "C++ API", value: 25, color: COLORS[1] },
            { name: "Materials", value: 15, color: COLORS[2] },
            { name: "Physics", value: 10, color: COLORS[3] },
            { name: "Animation", value: 8, color: COLORS[4] },
            { name: "Rendering", value: 7, color: COLORS[5] },
          ]

          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1000))
          setData(mockData)
        } else {
          // Use the Supabase URL from environment variables
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

          if (!supabaseUrl) {
            throw new Error("Supabase URL is not configured")
          }

          // Fetch real data from API
          const response = await fetch("/api/analytics/category-distribution")

          if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()

          // Map the API response to our data structure
          const categoryData: CategoryData[] = result.data.map((item: any, index: number) => ({
            name: item.category,
            value: item.count,
            color: COLORS[index % COLORS.length],
          }))

          setData(categoryData)
        }
      } catch (err) {
        console.error("Error fetching category distribution data:", err)
        setError(err instanceof Error ? err.message : "Failed to load category distribution data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[250px] w-full rounded-md" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (data.length === 0) {
      return <p className="text-center text-muted-foreground">No category data available</p>
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} documents`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Categories</CardTitle>
        <CardDescription>Distribution of documents by category</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
