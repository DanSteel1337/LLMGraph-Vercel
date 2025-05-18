"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import apiClient from "@/lib/api-client"

interface TrendData {
  date: string
  searches: number
  successRate: number
}

// Mock data for development and fallback
const MOCK_TRENDS: TrendData[] = [
  { date: "2023-05-01", searches: 45, successRate: 82 },
  { date: "2023-05-02", searches: 52, successRate: 78 },
  { date: "2023-05-03", searches: 61, successRate: 85 },
  { date: "2023-05-04", searches: 48, successRate: 79 },
  { date: "2023-05-05", searches: 64, successRate: 88 },
  { date: "2023-05-06", searches: 57, successRate: 84 },
  { date: "2023-05-07", searches: 68, successRate: 91 },
]

export function SearchTrends() {
  const [data, setData] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("week")
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const fetchSearchTrends = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setIsMockData(false)

        // Check if we're on the login page
        const isLoginPage =
          typeof window !== "undefined" &&
          (window.location.pathname === "/login" || window.location.pathname === "/signup")

        // Use mock data if on login page or if env var is set
        if (isLoginPage || process.env.USE_MOCK_DATA === "true") {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500))
          setData(MOCK_TRENDS)
          setIsMockData(true)
          return
        }

        // Fetch real data from API
        const response = await apiClient.analytics.getSearchTrends()

        if (Array.isArray(response.data)) {
          setData(response.data)
          setIsMockData(!!response.metadata?.isMockData)
        } else {
          throw new Error("Invalid data format received")
        }
      } catch (error) {
        console.error("Error fetching search trends:", error)
        setError("Failed to fetch search trends")

        // Use mock data as fallback
        setData(MOCK_TRENDS)
        setIsMockData(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchTrends()
  }, [activeTab])

  const getFilteredData = () => {
    if (activeTab === "week") {
      return data.slice(-7)
    } else if (activeTab === "2weeks") {
      return data.slice(-14)
    } else {
      return data
    }
  }

  const filteredData = getFilteredData()
  const maxSearches = Math.max(...filteredData.map((d) => d.searches), 100)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (error && !isMockData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No search trend data available</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {isMockData && error && <div className="text-xs text-amber-600 mb-2">Showing mock data. Error: {error}</div>}

      <Tabs defaultValue="week" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="week">Last 7 Days</TabsTrigger>
            <TabsTrigger value="2weeks">Last 14 Days</TabsTrigger>
            <TabsTrigger value="month">Last 30 Days</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-primary/80"></div>
              <span className="text-xs">Searches</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="text-xs">Success Rate</span>
            </div>
          </div>
        </div>

        <TabsContent value="week" className="mt-2">
          <div className="h-[200px] relative">
            <ChartContent data={filteredData} maxSearches={maxSearches} />
          </div>
        </TabsContent>

        <TabsContent value="2weeks" className="mt-2">
          <div className="h-[200px] relative">
            <ChartContent data={filteredData} maxSearches={maxSearches} />
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-2">
          <div className="h-[200px] relative">
            <ChartContent data={filteredData} maxSearches={maxSearches} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChartContent({ data, maxSearches }: { data: TrendData[]; maxSearches: number }) {
  return (
    <>
      {/* Chart grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between border-b border-t border-dashed border-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-full border-b border-dashed border-border/30 h-0"></div>
        ))}
      </div>

      {/* Chart bars */}
      <div className="absolute inset-0 flex items-end justify-between pt-5">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1 w-full">
            <div className="relative w-full flex flex-col items-center">
              {/* Success rate line */}
              <div
                className="absolute bottom-0 h-1 bg-green-500/80 rounded-full"
                style={{
                  width: "2px",
                  height: `${(item.successRate / 100) * 100}%`,
                  maxHeight: "100%",
                }}
              ></div>

              {/* Search count bar */}
              <div
                className="w-[60%] bg-primary/80 rounded-t-sm"
                style={{
                  height: `${(item.searches / maxSearches) * 100}%`,
                  minHeight: "4px",
                }}
              ></div>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">{formatDate(item.date)}</span>
          </div>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="absolute -left-6 inset-y-0 flex flex-col justify-between text-[10px] text-muted-foreground py-1">
        <div>100</div>
        <div>75</div>
        <div>50</div>
        <div>25</div>
        <div>0</div>
      </div>
    </>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
