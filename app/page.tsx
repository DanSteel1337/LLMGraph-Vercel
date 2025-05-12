import type { Metadata } from "next"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardLayoutContainer } from "@/components/dashboard-layout-container"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ProtectedRouteContainer } from "@/components/auth/protected-route-container"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { PopularSearches } from "@/components/dashboard/popular-searches"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"

export const metadata: Metadata = {
  title: "UE Documentation RAG Dashboard",
  description: "Dashboard for Unreal Engine Documentation RAG system",
}

export default function DashboardPage() {
  return (
    <ProtectedRouteContainer>
      <ProtectedRoute>
        <DashboardLayoutContainer>
          <DashboardLayout>
            <div className="container py-6">
              <div className="grid gap-6">
                <div>
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground">Overview of your Unreal Engine Documentation RAG system</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <DashboardStats />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="col-span-2">
                    <RecentDocuments />
                  </div>
                  <div>
                    <PopularSearches />
                  </div>
                </div>

                <div>
                  <CategoryDistribution />
                </div>
              </div>
            </div>
          </DashboardLayout>
        </DashboardLayoutContainer>
      </ProtectedRoute>
    </ProtectedRouteContainer>
  )
}
