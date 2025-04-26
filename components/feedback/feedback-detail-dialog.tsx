"use client"

import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Feedback } from "./feedback-management"

interface FeedbackDetailDialogProps {
  feedback: Feedback
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (status: "approved" | "rejected") => void
}

export function FeedbackDetailDialog({ feedback, open, onOpenChange, onStatusChange }: FeedbackDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Feedback Details</DialogTitle>
          <DialogDescription>Review the feedback and suggested correction</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Document</h3>
            <p className="text-sm">{feedback.documentTitle}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Status</h3>
            <Badge
              variant={
                feedback.status === "approved" ? "default" : feedback.status === "pending" ? "outline" : "destructive"
              }
            >
              {feedback.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Submitted By</h3>
            <p className="text-sm">{feedback.submittedBy}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Submitted At</h3>
            <p className="text-sm">{new Date(feedback.submittedAt).toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Original Content</h3>
            <div className="rounded-md bg-muted p-3 text-sm">{feedback.content}</div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Suggested Correction</h3>
            <div className="rounded-md bg-muted p-3 text-sm">{feedback.correction}</div>
          </div>
        </div>

        <DialogFooter>
          {feedback.status === "pending" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => onStatusChange("rejected")}>
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={() => onStatusChange("approved")}>
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
