"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { apiClient } from "@/lib/api-client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { logError } from "@/lib/error-handler"
import { shouldUseMockData } from "@/lib/environment"
import { MOCK_SEARCH_TRENDS } from "@/lib/mock-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Type for search trend data
interface SearchTrend {
  date: string
  searches: number
}

export function SearchTrends() {
  const [trends, setTrends] = useState<SearchTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("week")
  const [chartType, setChartType] = useState("line")
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    async function fetchSearchTrends() {
      try {
        setLoading(true)

        // Check if we should use mock data based on environment
        if (shouldUseMockData()) {
          // Use mock data directly
          setTrends(MOCK_SEARCH_TRENDS)
          setIsMockData(true)
          setLoading(false)
          return
        }

        // Updated to use the consolidated analytics route
        const response = await apiClient.get(`/api/analytics/search-trends?period=${period}`)

        if (response.error) {
          throw new Error(response.error)
        }

        // Check if the response indicates it's mock data
        if (response.isMockData) {
          setIsMockData(true)
        }

        setTrends(response.data)
      } catch (err) {
        logError(err, "search_trends_fetch_error")
        setError(err instanceof Error ? err.message : "Failed to load search trends")

        // Use mock data as fallback
        setTrends(MOCK_SEARCH_TRENDS)
        setIsMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSearchTrends()
  }, [period])

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Search Trends</CardTitle>
          <CardDescription>Number of searches over time</CardDescription>
        </div>
        <Tabs defaultValue="week" onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex h-[300px] items-center justify-center text-red-500">{error}</div>
        ) : (
          <div>
            {isMockData && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Showing mock data in preview environment</AlertDescription>
              </Alert>
            )}
            <div className="mb-4 flex justify-end">
              <Tabs defaultValue="line" onValueChange={setChartType}>
                <TabsList>
                  <TabsTrigger value="line">Line</TabsTrigger>
                  <TabsTrigger value="bar">Bar</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart
                    data={trends}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="searches" stroke="#8884d8" activeDot={{ r: 8 }} name="Searches" />
                  </LineChart>
                ) : (
                  <BarChart
                    data={trends}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="searches" fill="#8884d8" name="Searches" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
