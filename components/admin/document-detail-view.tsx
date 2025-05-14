"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentPreview } from "@/components/admin/document-preview"
import { ArrowLeft, Trash2, RefreshCw } from "lucide-react"
import { deleteDocument } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DocumentDetailViewProps {
  documentId: string
}

export function DocumentDetailView({ documentId }: DocumentDetailViewProps) {
  const [document, setDocument] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) throw new Error("Failed to fetch document")
        const data = await response.json()
        setDocument(data)
      } catch (error) {
        console.error("Error fetching document:", error)
        toast({
          title: "Error",
          description: "Failed to load document details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [documentId, toast])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteDocument(documentId)
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully",
      })
      router.push("/admin?tab=documents")
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading || isDeleting}
          className="flex items-center gap-2"
        >
          {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <DocumentPreview documentId={documentId} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document and all associated data, including chunks and vector embeddings.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
