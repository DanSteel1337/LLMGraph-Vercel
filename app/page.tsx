"use client"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { NavigationProvider, useNavigation } from "@/contexts/navigation-context"

// Import components
import SearchInterface from "@/components/search/search-interface"
import { DocumentManagement } from "@/components/documents/document-management"
import { DocumentUploadForm } from "@/components/upload/document-upload-form"
import { FeedbackManagement } from "@/components/feedback/feedback-management"
import SystemStatus from "@/components/dashboard/system-status" // Fixed import
import { SettingsForm } from "@/components/settings/settings-form"
import { AdvancedAnalytics } from "@/components/analytics/advanced-analytics"

// Loading fallback component
function LoadingFallback({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">{message}</span>
    </div>
  )
}

// Main dashboard component
function Dashboard() {
  const { activeTab, setActiveTab } = useNavigation()

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Unreal Engine Documentation</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EnhancedErrorBoundary componentName="SearchInterface">
                <Suspense fallback={<LoadingFallback message="Loading search interface..." />}>
                  <SearchInterface />
                </Suspense>
              </EnhancedErrorBoundary>
            </div>
            <div className="lg:col-span-1">
              <EnhancedErrorBoundary componentName="SystemStatus">
                <Suspense fallback={<LoadingFallback message="Loading system status..." />}>
                  <SystemStatus />
                </Suspense>
              </EnhancedErrorBoundary>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in-50 duration-300">
          <EnhancedErrorBoundary componentName="DocumentManagement">
            <Suspense fallback={<LoadingFallback message="Loading document management..." />}>
              <DocumentManagement />
            </Suspense>
          </EnhancedErrorBoundary>
        </TabsContent>

        <TabsContent value="upload" className="animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedErrorBoundary componentName="DocumentUploadForm">
              <Suspense fallback={<LoadingFallback message="Loading upload form..." />}>
                <DocumentUploadForm />
              </Suspense>
            </EnhancedErrorBoundary>

            <Card>
              <CardHeader>
                <CardTitle>Upload Instructions</CardTitle>
                <CardDescription>How to prepare your documents for upload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Supported File Types</h3>
                    <p className="text-sm text-muted-foreground">PDF, Markdown, and Text files are supported.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Document Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      For best results, ensure your documents have clear headings and sections. This helps our system
                      better understand and index your content.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Metadata</h3>
                    <p className="text-sm text-muted-foreground">
                      Adding proper metadata like category and version improves search accuracy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="animate-in fade-in-50 duration-300">
          <EnhancedErrorBoundary componentName="FeedbackManagement">
            <Suspense fallback={<LoadingFallback message="Loading feedback management..." />}>
              <FeedbackManagement />
            </Suspense>
          </EnhancedErrorBoundary>
        </TabsContent>

        <TabsContent value="analytics" className="animate-in fade-in-50 duration-300">
          <EnhancedErrorBoundary componentName="AdvancedAnalytics">
            <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
              <AdvancedAnalytics />
            </Suspense>
          </EnhancedErrorBoundary>
        </TabsContent>

        <TabsContent value="settings" className="animate-in fade-in-50 duration-300">
          <EnhancedErrorBoundary componentName="SettingsForm">
            <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
              <SettingsForm />
            </Suspense>
          </EnhancedErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Wrap the dashboard with the navigation provider
export default function Page() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  return (
    <NavigationProvider initialTab={tabParam || "search"}>
      <Dashboard />
    </NavigationProvider>
  )
}
