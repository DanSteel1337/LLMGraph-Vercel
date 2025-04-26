"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { updateDocument } from "@/lib/api"
import type { Document } from "./document-management"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  version: z.string({
    required_error: "Please select an engine version.",
  }),
  description: z.string().optional(),
  tags: z.string().optional(),
})

const categories = [
  { value: "blueprints", label: "Blueprints" },
  { value: "cpp", label: "C++" },
  { value: "animation", label: "Animation" },
  { value: "rendering", label: "Rendering" },
  { value: "physics", label: "Physics" },
  { value: "ui", label: "UI" },
  { value: "audio", label: "Audio" },
  { value: "networking", label: "Networking" },
]

const versions = [
  { value: "5.3", label: "UE 5.3" },
  { value: "5.2", label: "UE 5.2" },
  { value: "5.1", label: "UE 5.1" },
  { value: "5.0", label: "UE 5.0" },
  { value: "4.27", label: "UE 4.27" },
]

interface DocumentEditDialogProps {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (document: Document) => void
}

export function DocumentEditDialog({ document, open, onOpenChange, onSave }: DocumentEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: document.title,
      category: document.category,
      version: document.version,
      description: "",
      tags: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)

    try {
      const updatedDoc = await updateDocument(document.id, values)

      toast({
        title: "Document updated",
        description: "Your document has been updated successfully.",
      })

      onSave({
        ...document,
        ...updatedDoc,
      })
    } catch (error) {
      console.error("Update failed:", error)
      toast({
        title: "Update failed",
        description: "There was an error updating your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>Update the document details. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Version</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select engine version" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version.value} value={version.value}>
                            {version.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief description of the document"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A short description of what this document contains</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter comma-separated tags" {...field} />
                  </FormControl>
                  <FormDescription>Optional tags to help with categorization (comma-separated)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
