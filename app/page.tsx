import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { PopularSearches } from "@/components/dashboard/popular-searches"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { DevelopmentNotice } from "@/components/development-notice"
import { ErrorBoundary } from "@/components/error-boundary"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <DevelopmentNotice />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Unreal Engine documentation RAG system</p>
      </div>

      <ErrorBoundary>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <ErrorBoundary>
              <DashboardStats />
            </ErrorBoundary>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>Recently added or updated documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary>
                    <RecentDocuments />
                  </ErrorBoundary>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Popular Searches</CardTitle>
                  <CardDescription>Most frequent search queries</CardDescription>
                </CardHeader>
                <CardContent>
                  <ErrorBoundary>
                    <PopularSearches />
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Distribution of documents across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <CategoryDistribution />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Detailed analytics will be displayed here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Activity log coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  )
}
