"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCategoryDistribution } from "@/lib/api"

interface CategoryData {
  name: string
  count: number
  percentage: number
}

export function CategoryDistribution() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getCategoryDistribution = async () => {
      try {
        const data = await fetchCategoryDistribution()
        setCategories(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch category distribution:", error)
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

  if (categories.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No category data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-sm text-muted-foreground">{category.count} docs</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${category.percentage}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{category.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
