import { FeedbackManagement } from "@/components/feedback/feedback-management"

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback Management</h1>
        <p className="text-muted-foreground">Manage user feedback and corrections for documentation</p>
      </div>

      <FeedbackManagement />
    </div>
  )
}
