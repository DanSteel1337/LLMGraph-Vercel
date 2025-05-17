import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { SearchTrends } from "@/components/dashboard/search-trends"
import { PopularSearches } from "@/components/dashboard/popular-searches"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { SystemStatus } from "@/components/dashboard/system-status"
import { DocumentManagement } from "@/components/documents/document-management"
import { SearchInterface } from "@/components/search/search-interface"
import { FeedbackManagement } from "@/components/feedback/feedback-management"
import { SettingsForm } from "@/components/settings/settings-form"
import { DocumentUploadFormWrapper } from "@/components/upload/document-upload-form-wrapper"
import { ProtectedPageWrapper } from "@/components/protected-page-wrapper"
import { EnvVarChecker } from "@/components/dashboard/env-var-checker"

// Disable static generation for this page
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function DashboardPage() {
  return (
    <ProtectedPageWrapper>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">UE-RAG Dashboard</h1>

        <EnvVarChecker />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={<div>Loading stats...</div>}>
              <DashboardStats />
            </Suspense>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Document distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading chart...</div>}>
                    <CategoryDistribution />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Search Trends</CardTitle>
                  <CardDescription>Search volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading chart...</div>}>
                    <SearchTrends />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Searches</CardTitle>
                  <CardDescription>Most frequent search terms</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading searches...</div>}>
                    <PopularSearches />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>Recently added documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading documents...</div>}>
                    <RecentDocuments />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>Add new documents to the knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUploadFormWrapper />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>View, edit, and delete documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading documents...</div>}>
                  <DocumentManagement />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Interface</CardTitle>
                <CardDescription>Search the knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <SearchInterface />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Management</CardTitle>
                <CardDescription>View and respond to user feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading feedback...</div>}>
                  <FeedbackManagement />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Monitor system health and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading system status...</div>}>
                  <SystemStatus />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPageWrapper>
  )
}
