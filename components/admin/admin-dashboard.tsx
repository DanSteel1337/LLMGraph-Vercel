"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SystemStatus } from "@/components/dashboard/system-status"
import { DocumentManagement } from "@/components/documents/document-management"
import { DocumentUploadForm } from "@/components/upload/document-upload-form"
import { SearchTrends } from "@/components/dashboard/search-trends"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { PopularSearches } from "@/components/dashboard/popular-searches"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Knowledge Base Management</h2>
        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current status of all connected services</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemStatus key={`system-status-${refreshKey}`} />
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Recently added documents</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentDocuments key={`recent-docs-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>

          <DashboardStats key={`stats-${refreshKey}`} />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Document distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDistribution key={`categories-${refreshKey}`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Searches</CardTitle>
                <CardDescription>Most frequent search queries</CardDescription>
              </CardHeader>
              <CardContent>
                <PopularSearches key={`searches-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>View, edit, and delete documents in the knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentManagement key={`doc-management-${refreshKey}`} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Add new documents to the knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadForm key={`upload-form-${refreshKey}`} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Search Trends</CardTitle>
                <CardDescription>Search volume over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <SearchTrends key={`search-trends-${refreshKey}`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Searches</CardTitle>
                <CardDescription>Most frequent search queries</CardDescription>
              </CardHeader>
              <CardContent>
                <PopularSearches key={`popular-searches-${refreshKey}`} limit={10} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
