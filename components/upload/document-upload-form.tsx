"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadDocument } from "@/lib/api"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  file: z.instanceof(FileList).refine((files) => files.length > 0, {
    message: "Please select a file.",
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

export function DocumentUploadForm() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true)

    try {
      const file = values.file[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", values.title)
      formData.append("category", values.category)
      formData.append("version", values.version)

      if (values.description) {
        formData.append("description", values.description)
      }

      if (values.tags) {
        formData.append("tags", values.tags)
      }

      await uploadDocument(formData)

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      })

      form.reset()
      router.refresh()
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Add a new document to the Unreal Engine documentation RAG system</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document title" {...field} />
                    </FormControl>
                    <FormDescription>The title of the document</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Document File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.md,.txt,.html,.doc,.docx"
                        onChange={(e) => onChange(e.target.files)}
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription>Supported formats: PDF, Markdown, TXT, HTML, DOC, DOCX</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    <FormDescription>The primary category for this document</FormDescription>
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
                    <FormDescription>The Unreal Engine version this document applies to</FormDescription>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
