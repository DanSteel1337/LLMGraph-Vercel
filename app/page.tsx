import type { Metadata } from "next"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { PopularSearches } from "@/components/dashboard/popular-searches"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { SystemStatus } from "@/components/dashboard/system-status"
import { SearchTrends } from "@/components/dashboard/search-trends"
import { ProtectedRouteContainer } from "@/components/auth/protected-route-container"

export const metadata: Metadata = {
  title: "UE Documentation RAG Dashboard",
  description: "Dashboard for Unreal Engine Documentation RAG system",
}

export default function DashboardPage() {
  return (
    <ProtectedRouteContainer>
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto p-6 space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your Unreal Engine Documentation RAG system</p>
          </div>

          <DashboardStats />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Recent Documents</h3>
                  <RecentDocuments />
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Category Distribution</h3>
                  <CategoryDistribution />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Popular Searches</h3>
                  <PopularSearches />
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">System Status</h3>
                  <SystemStatus />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Search Trends</h3>
              <SearchTrends />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRouteContainer>
  )
}
