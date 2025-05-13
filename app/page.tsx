import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { SearchTrends } from "@/components/dashboard/search-trends"
import { PopularSearches } from "@/components/dashboard/popular-searches"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { SystemStatus } from "@/components/dashboard/system-status"
import { EnvVarChecker } from "@/components/dashboard/env-var-checker"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryDistribution />
        <SystemStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchTrends />
        <EnvVarChecker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PopularSearches />
        <RecentDocuments />
      </div>
    </div>
  )
}
