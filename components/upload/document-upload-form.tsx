"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Upload, AlertCircle, FileText, X, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { uploadDocument } from "@/lib/api"
import { DocumentPreview } from "./document-preview"

// Define allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = [
  {
    type: "application/pdf",
    extension: ".pdf",
    name: "PDF",
  },
  {
    type: "text/markdown",
    extension: ".md",
    name: "Markdown",
  },
  {
    type: "text/plain",
    extension: ".txt",
    name: "Text",
  },
  {
    type: "text/html",
    extension: ".html",
    name: "HTML",
  },
  {
    type: "application/msword",
    extension: ".doc",
    name: "Word",
  },
  {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: ".docx",
    name: "Word",
  },
]

// Create a string of accepted file extensions for the file input
const ACCEPTED_FILE_EXTENSIONS = ALLOWED_FILE_TYPES.map((type) => type.extension).join(",")

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Create a schema that works in both browser and server environments
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  // Enhanced file validation
  file: z
    .any()
    .refine(
      (files) => {
        // Skip validation during SSR
        if (typeof window === "undefined") return true
        // Check if files exist and at least one file is selected
        return files instanceof FileList && files.length > 0
      },
      { message: "Please select a file." },
    )
    .refine(
      (files) => {
        // Skip validation during SSR
        if (typeof window === "undefined") return true
        if (!(files instanceof FileList) || files.length === 0) return true

        // Check file size
        return files[0].size <= MAX_FILE_SIZE
      },
      { message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
    )
    .refine(
      (files) => {
        // Skip validation during SSR
        if (typeof window === "undefined") return true
        if (!(files instanceof FileList) || files.length === 0) return true

        // Check file type
        const file = files[0]
        return ALLOWED_FILE_TYPES.some(
          (allowedType) => file.type === allowedType.type || file.name.toLowerCase().endsWith(allowedType.extension),
        )
      },
      {
        message: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map((t) => t.name).join(", ")}.`,
      },
    ),
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

interface DocumentUploadFormProps {
  router: any
}

export function DocumentUploadForm({ router }: DocumentUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  })

  // Function to validate file before form submission
  const validateFile = (file: File | null): boolean => {
    if (!file) {
      setFileError("Please select a file.")
      return false
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
      return false
    }

    // Check file type
    const isValidType = ALLOWED_FILE_TYPES.some(
      (allowedType) => file.type === allowedType.type || file.name.toLowerCase().endsWith(allowedType.extension),
    )

    if (!isValidType) {
      setFileError(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map((t) => t.name).join(", ")}.`)
      return false
    }

    setFileError(null)
    return true
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      validateFile(file)
      form.setValue("file", files)
    } else {
      setSelectedFile(null)
      setFileError(null)
    }
  }

  // Process the selected file
  const processFile = (file: File) => {
    setSelectedFile(file)
    const isValid = validateFile(file)

    if (isValid) {
      // Create a FileList-like object
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      const fileList = dataTransfer.files

      // Update the form value
      form.setValue("file", fileList)

      // Update the file input value for consistency
      if (fileInputRef.current) {
        fileInputRef.current.files = fileList
      }
    }
  }

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null)
    setFileError(null)
    form.setValue("file", undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isDragging) {
        setIsDragging(true)
      }
    },
    [isDragging],
  )

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set isDragging to false if we're leaving the dropzone (not a child element)
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Only process the first file
      processFile(files[0])
    }
  }, [])

  // Handle click on drop zone
  const handleDropZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Get file type badge color
  const getFileTypeBadgeColor = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    switch (extension) {
      case "pdf":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "md":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "txt":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "html":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "doc":
      case "docx":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate file again before submission
    if (!selectedFile || !validateFile(selectedFile)) {
      return
    }

    setIsUploading(true)

    try {
      // Only access FileList in the browser
      if (typeof window !== "undefined" && values.file instanceof FileList) {
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
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        router.refresh()
      }
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

  // Rest of the component remains the same...
  // (I'm omitting the JSX part for brevity since it doesn't change)

  // Return the JSX for the form
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
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept={ACCEPTED_FILE_EXTENSIONS}
                          ref={fileInputRef}
                          onChange={(e) => {
                            handleFileChange(e)
                            onChange(e.target.files)
                          }}
                          className="hidden"
                          {...rest}
                        />

                        {!selectedFile ? (
                          <div
                            ref={dropZoneRef}
                            className={cn(
                              "border-2 border-dashed rounded-md p-6 transition-colors cursor-pointer",
                              isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50",
                            )}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleDropZoneClick}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                handleDropZoneClick()
                              }
                            }}
                            role="button"
                            aria-controls="file-upload"
                            aria-label="Upload a file by clicking or dragging and dropping"
                          >
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                              <UploadCloud
                                className={cn(
                                  "h-10 w-10 transition-colors",
                                  isDragging ? "text-primary" : "text-muted-foreground",
                                )}
                              />
                              <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">
                                  {isDragging ? "Drop your file here" : "Drag & drop your file here"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  or <span className="text-primary font-medium">click to browse</span>
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Supported formats: PDF, Markdown, TXT, HTML, DOC, DOCX (max 5MB)
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center p-3 border rounded-md bg-muted/50">
                            <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className={getFileTypeBadgeColor(selectedFile.name)}>
                                  {selectedFile.name.split(".").pop()?.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatFileSize(selectedFile.size)}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={clearFile}
                              className="ml-2 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove file</span>
                            </Button>
                          </div>
                        )}

                        {fileError && (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{fileError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </FormControl>
                    {selectedFile && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="text-xs"
                          >
                            {showPreview ? "Hide Preview" : "Show Preview"}
                          </Button>
                        </div>

                        {showPreview && <DocumentPreview file={selectedFile} className="mt-2" />}
                      </div>
                    )}
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
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                form.reset()
                clearFile()
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isUploading || !!fileError || !selectedFile}>
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
