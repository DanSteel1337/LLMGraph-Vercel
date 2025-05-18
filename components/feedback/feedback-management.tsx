"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import FeedbackDetailDialog from "./feedback-detail-dialog"
import { apiClient } from "@/lib/api-client"

export interface Feedback {
  id: string
  content: string
  correction: string | null
  status: string
  created_at: string
  document_id: string | null
  submittedBy?: string
  submittedAt?: string
  documentTitle?: string
}

export function FeedbackManagement() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [createTableMessage, setCreateTableMessage] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get("/api/feedback")
        const data = await response.data

        // Check if the response contains mock data
        if (data.isMockData) {
          setIsMockData(true)
        }

        if (data.message && data.message.includes("does not exist")) {
          setTableExists(false)
          setCreateTableMessage(data.message)
          setFeedback([])
        } else if (data.error) {
          setError(data.error)
          setFeedback([])
        } else {
          setFeedback(data.feedback || [])
          setTableExists(true)
        }
      } catch (err) {
        setError("Failed to fetch feedback")
        console.error("Error fetching feedback:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  const handleOpenDetail = (item: Feedback) => {
    setSelectedFeedback(item)
  }

  const handleCloseDetail = () => {
    setSelectedFeedback(null)
  }

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!selectedFeedback) return

    try {
      const response = await apiClient.patch(`/api/feedback/${selectedFeedback.id}`, { status })

      if (response.status === 200) {
        // Update the feedback list
        setFeedback((prev) => prev.map((item) => (item.id === selectedFeedback.id ? { ...item, status } : item)))
        // Close the dialog
        setSelectedFeedback(null)
      } else {
        const data = await response.data
        setError(data.error || "Failed to update feedback status")
      }
    } catch (err) {
      setError("Failed to update feedback status")
      console.error("Error updating feedback:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "resolved":
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>Loading feedback data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>Manage user feedback on search results</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Table Missing</AlertTitle>
            <AlertDescription>
              {createTableMessage || "The feedback table does not exist in your database."}
              <div className="mt-4">
                <p className="text-sm font-medium">Run this SQL in your Supabase SQL Editor:</p>
                <pre className="mt-2 rounded bg-slate-950 p-4 text-xs text-white overflow-x-auto">
                  {`CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  correction TEXT,
  status TEXT DEFAULT 'pending',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>Error loading feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Feedback</CardTitle>
        <CardDescription>Manage user feedback on search results</CardDescription>
      </CardHeader>
      <CardContent>
        {isMockData && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Preview Mode</AlertTitle>
            <AlertDescription>
              You are viewing mock feedback data. Connect to a database in production for real feedback.
            </AlertDescription>
          </Alert>
        )}

        {feedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No feedback submissions yet</div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium truncate flex-1">{item.content.substring(0, 100)}...</div>
                  <Badge className={`ml-2 ${getStatusColor(item.status)}`}>{item.status || "Pending"}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDetail(item)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedFeedback && (
          <FeedbackDetailDialog
            feedback={selectedFeedback}
            open={!!selectedFeedback}
            onClose={handleCloseDetail}
            onStatusChange={handleStatusChange}
          />
        )}
      </CardContent>
    </Card>
  )
}

// Also add a default export for flexibility
export default FeedbackManagement
