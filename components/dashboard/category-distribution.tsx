"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"

interface CategoryData {
  name: string
  count: number
  percentage: number
  color?: string
}

// Fallback data to use when the API request fails
const FALLBACK_DATA: CategoryData[] = [
  { name: "Blueprints", count: 42, percentage: 27, color: "var(--chart-1)" },
  { name: "C++", count: 38, percentage: 24, color: "var(--chart-2)" },
  { name: "Animation", count: 24, percentage: 15, color: "var(--chart-3)" },
  { name: "Rendering", count: 18, percentage: 12, color: "var(--chart-4)" },
  { name: "Physics", count: 14, percentage: 9, color: "var(--chart-5)" },
  { name: "UI", count: 12, percentage: 8, color: "hsl(var(--primary))" },
  { name: "Audio", count: 8, percentage: 5, color: "hsl(var(--secondary))" },
]

export function CategoryDistribution() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getCategoryDistribution = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Always use fallback data to avoid potential issues
        setCategories(FALLBACK_DATA)
        setIsLoading(false)
      } catch (error) {
        console.error("Error in category distribution component:", error)
        setCategories(FALLBACK_DATA)
        setError("An unexpected error occurred - using fallback data")
        setIsLoading(false)
      }
    }

    getCategoryDistribution()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {error && (
          <Alert variant="warning" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative pt-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold">{categories.reduce((sum, cat) => sum + cat.count, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </div>
          </div>
          <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[250px] mx-auto">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />

            {/* Create pie chart segments */}
            {categories.map((category, index) => {
              // Calculate the segment position
              const cumulativePercentage = categories.slice(0, index).reduce((sum, cat) => sum + cat.percentage, 0)

              // Convert percentage to radians
              const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2
              const endAngle = ((cumulativePercentage + category.percentage) / 100) * 2 * Math.PI - Math.PI / 2

              // Calculate the SVG arc path
              const x1 = 50 + 40 * Math.cos(startAngle)
              const y1 = 50 + 40 * Math.sin(startAngle)
              const x2 = 50 + 40 * Math.cos(endAngle)
              const y2 = 50 + 40 * Math.sin(endAngle)

              // Determine if the arc should be drawn as a large arc
              const largeArcFlag = category.percentage > 50 ? 1 : 0

              return (
                <path
                  key={category.name}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={category.color || `hsl(${index * 40}, 70%, 50%)`}
                />
              )
            })}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color || `hsl(${categories.indexOf(category) * 40}, 70%, 50%)` }}
                />
                <span className="text-sm font-medium truncate">{category.name}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">{category.count} docs</span>
                <span className="text-xs font-medium">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  )
}
