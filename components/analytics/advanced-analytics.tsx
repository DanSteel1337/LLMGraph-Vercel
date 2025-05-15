"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Loader2 } from "lucide-react"

export function AdvancedAnalytics() {
  const [period, setPeriod] = useState("week")
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/analytics/search?period=${period}&metric=all`)

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`)
        }

        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setError("Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Search Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="volume" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="volume">Search Volume</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="popular">Popular Searches</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Search Volume Over Time</CardTitle>
              <CardDescription>Number of searches performed per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.volume || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Searches" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Search Performance Metrics</CardTitle>
              <CardDescription>Query time and result counts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.performance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgQueryTime"
                      name="Avg Query Time (ms)"
                      stroke="#8884d8"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="p95QueryTime"
                      name="P95 Query Time (ms)"
                      stroke="#82ca9d"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgResultCount"
                      name="Avg Results"
                      stroke="#ff7300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle>Popular Search Terms</CardTitle>
              <CardDescription>Most frequently searched terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={analyticsData?.popular || []} margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="query" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Search Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback Metrics</CardTitle>
              <CardDescription>Ratings and feedback trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.feedback || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgRating" name="Avg Rating (0-5)" stroke="#8884d8" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="positiveRate"
                      name="Positive Rate (%)"
                      stroke="#82ca9d"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="feedbackCount"
                      name="Feedback Count"
                      stroke="#ff7300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VectorSpaceVisualization />
    </div>
  )
}

function VectorSpaceVisualization() {
  const [vectorData, setVectorData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredVector, setHoveredVector] = useState<any>(null)

  useEffect(() => {
    async function fetchVectorData() {
      try {
        setIsLoading(true)
        setError(null)

        const url = new URL("/api/analytics/vectors", window.location.origin)
        if (category) {
          url.searchParams.append("category", category)
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch vector data: ${response.statusText}`)
        }

        const data = await response.json()
        setVectorData(data)
      } catch (error) {
        console.error("Error fetching vector data:", error)
        setError("Failed to load vector visualization")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVectorData()
  }, [category])

  // Draw vectors on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !vectorData?.vectors) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Draw points
    vectorData.vectors.forEach((vector: any) => {
      // Scale coordinates to canvas size
      const x = (vector.x / 600) * canvas.width
      const y = (vector.y / 400) * canvas.height

      // Determine color based on category
      let color = "#8884d8" // Default purple
      if (vector.metadata?.category === "API") color = "#82ca9d" // Green
      if (vector.metadata?.category === "Guide") color = "#ff7300" // Orange
      if (vector.metadata?.category === "Tutorial") color = "#0088fe" // Blue

      // Draw circle
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }, [vectorData])

  // Handle mouse move for tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !vectorData?.vectors) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find vector under cursor
    const vector = vectorData.vectors.find((v: any) => {
      const vx = (v.x / 600) * canvas.width
      const vy = (v.y / 400) * canvas.height
      const distance = Math.sqrt(Math.pow(x - vx, 2) + Math.pow(y - vy, 2))
      return distance <= 5
    })

    setHoveredVector(vector || null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Space Visualization</CardTitle>
        <CardDescription>2D projection of document vectors</CardDescription>
        <Select value={category || ""} onValueChange={(val) => setCategory(val || null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="API">API</SelectItem>
            <SelectItem value="Guide">Guide</SelectItem>
            <SelectItem value="Tutorial">Tutorial</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] border rounded-md relative">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-destructive">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredVector(null)}
              />
              {hoveredVector && (
                <div
                  className="absolute bg-background border rounded-md p-2 shadow-md z-10"
                  style={{
                    left: (hoveredVector.x / 600) * (canvasRef.current?.width || 0) + 10,
                    top: (hoveredVector.y / 400) * (canvasRef.current?.height || 0) + 10,
                  }}
                >
                  <p className="font-medium">{hoveredVector.metadata?.title}</p>
                  <p className="text-sm text-muted-foreground">Category: {hoveredVector.metadata?.category}</p>
                </div>
              )}
              <div className="absolute bottom-2 right-2 flex gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#8884d8]"></div>
                  <span className="text-xs">Other</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#82ca9d]"></div>
                  <span className="text-xs">API</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#ff7300]"></div>
                  <span className="text-xs">Guide</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#0088fe]"></div>
                  <span className="text-xs">Tutorial</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
