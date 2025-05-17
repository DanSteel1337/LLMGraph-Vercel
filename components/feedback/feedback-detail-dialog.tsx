"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Check, X } from "lucide-react"

interface Feedback {
  id: string
  content: string
  correction: string | null
  status: string
  created_at: string
  document_id: string | null
}

interface FeedbackDetailDialogProps {
  feedback: Feedback
  open: boolean
  onClose: () => void
  onStatusChange?: (status: "approved" | "rejected") => void
}

export default function FeedbackDetailDialog({ feedback, open, onClose, onStatusChange }: FeedbackDetailDialogProps) {
  const [adminNote, setAdminNote] = useState("")

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
      case "resolved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleApprove = () => {
    if (onStatusChange) {
      onStatusChange("approved")
    }
  }

  const handleReject = () => {
    if (onStatusChange) {
      onStatusChange("rejected")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Feedback Details
            <Badge className={getStatusColor(feedback.status)}>{feedback.status || "Pending"}</Badge>
          </DialogTitle>
          <DialogDescription>Review user feedback submission</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <h4 className="text-sm font-medium mb-1">Original Content</h4>
            <div className="p-3 bg-muted rounded-md text-sm">{feedback.content}</div>
          </div>

          {feedback.correction && (
            <div>
              <h4 className="text-sm font-medium mb-1">Suggested Correction</h4>
              <div className="p-3 bg-muted rounded-md text-sm">{feedback.correction}</div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-1">Submission Date</h4>
            <div className="text-sm">{new Date(feedback.created_at).toLocaleString()}</div>
          </div>

          {feedback.status === "pending" && (
            <div>
              <h4 className="text-sm font-medium mb-1">Admin Notes</h4>
              <Textarea
                placeholder="Add notes about this feedback..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="h-20"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          {feedback.status === "pending" && onStatusChange ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button variant="destructive" onClick={handleReject} className="gap-1">
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button variant="default" onClick={handleApprove} className="gap-1">
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </>
          ) : (
            <Button variant="default" onClick={onClose} className="ml-auto">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
