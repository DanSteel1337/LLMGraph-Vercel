"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { apiClient } from "@/lib/api-client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { logError } from "@/lib/error-handler"

// Type for category data
interface CategoryData {
  name: string
  value: number
  color: string
}

// Colors for the chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#A4DE6C"]

export function CategoryDistribution() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchCategoryDistribution() {
      try {
        setLoading(true)
        // Updated to use the consolidated analytics route
        const response = await apiClient.analytics.getCategoryDistribution()

        if (response.error) {
          throw new Error(response.error)
        }

        // Process the data
        const processedData = response.data.map((category, index) => ({
          name: category.name,
          value: category.count,
          color: COLORS[index % COLORS.length],
        }))

        setCategories(processedData)
      } catch (err) {
        logError(err, "category_distribution_fetch_error")
        setError(err instanceof Error ? err.message : "Failed to load category distribution")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryDistribution()
  }, [])

  // Filter categories based on active tab
  const getFilteredCategories = () => {
    if (activeTab === "all") return categories
    if (activeTab === "top5") return categories.slice(0, 5)
    return categories
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Document Categories</CardTitle>
        <CardDescription>Distribution of documents by category</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex h-[300px] items-center justify-center text-red-500">{error}</div>
        ) : (
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              <TabsTrigger value="top5">Top 5</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getFilteredCategories()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} documents`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="top5" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getFilteredCategories()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getFilteredCategories().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} documents`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
