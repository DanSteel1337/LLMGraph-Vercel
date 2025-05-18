/**
 * Shared types for document management functionality
 * This file centralizes document-related types to prevent circular dependencies
 */

export type Document = {
  id: string
  title: string
  category: string
  version: string
  uploadedAt: string
  status: "processed" | "processing" | "failed"
  size: number
  description?: string
  tags?: string
}

export interface DocumentEditDialogProps {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (document: Document) => void
}
