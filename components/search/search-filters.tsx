"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { shouldUseMockData } from "@/lib/environment"
import { getMockCategories, getMockVersions } from "@/lib/mock-data"
import apiClient from "@/lib/api-client"

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

export interface SearchFilters {
  categories?: string[]
  version?: string
  startDate?: string
  endDate?: string
}

export default function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableVersions, setAvailableVersions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Determine if we're using mock data
  const usingMockData = shouldUseMockData()

  // Load available filter options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        setLoading(true)

        if (usingMockData) {
          // Use mock data
          console.log("[MOCK] Using mock filter options")
          setAvailableCategories(getMockCategories())
          setAvailableVersions(getMockVersions())
        } else {
          // Fetch real data
          const [categoriesResponse, versionsResponse] = await Promise.all([
            apiClient.search.getCategories(),
            apiClient.search.getVersions(),
          ])

          if (categoriesResponse.success && categoriesResponse.data) {
            setAvailableCategories(categoriesResponse.data)
          }

          if (versionsResponse.success && versionsResponse.data) {
            setAvailableVersions(versionsResponse.data)
          }
        }
      } catch (error) {
        console.error("Error loading filter options:", error)
        // Fallback to mock data on error
        setAvailableCategories(getMockCategories())
        setAvailableVersions(getMockVersions())
      } finally {
        setLoading(false)
      }
    }

    loadFilterOptions()
  }, [usingMockData])

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(filters)
    setIsOpen(false)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({})
    onFiltersChange({})
    setIsOpen(false)
  }

  // Toggle category
  const toggleCategory = (category: string) => {
    setFilters((prev) => {
      const categories = prev.categories || []
      if (categories.includes(category)) {
        return {
          ...prev,
          categories: categories.filter((c) => c !== category),
        }
      } else {
        return {
          ...prev,
          categories: [...categories, category],
        }
      }
    })
  }

  // Set version
  const setVersion = (version: string) => {
    setFilters((prev) => ({
      ...prev,
      version,
    }))
  }

  // Set date range
  const setDateRange = (startDate?: string, endDate?: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }))
  }

  // Count active filters
  const activeFilterCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== ""
  }).length

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-8 px-2 lg:px-3">
            <Filter className="h-3.5 w-3.5 lg:mr-2" />
            <span className="hidden lg:inline-flex">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 rounded-full px-1 lg:ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={(filters.categories || []).includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Version</h4>
              <div className="grid gap-2">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  availableVersions.map((version) => (
                    <div key={version} className="flex items-center space-x-2">
                      <Checkbox
                        id={`version-${version}`}
                        checked={filters.version === version}
                        onCheckedChange={() => setVersion(version)}
                      />
                      <Label htmlFor={`version-${version}`} className="text-sm">
                        {version}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Date Range</h4>
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="start-date" className="text-xs">
                      Start Date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) => setDateRange(e.target.value, filters.endDate)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="end-date" className="text-xs">
                      End Date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) => setDateRange(filters.startDate, e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetFilters}>
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  )
}
