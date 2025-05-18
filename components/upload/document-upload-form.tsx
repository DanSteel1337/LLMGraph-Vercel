"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { shouldUseMockData } from "@/lib/environment"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"

export function DocumentUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [version, setVersion] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isMockData, setIsMockData] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if we should use mock data
  const useMockData = shouldUseMockData()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check file type
      if (!selectedFile.type.includes("pdf") && !selectedFile.type.includes("text")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or text file",
          variant: "destructive",
        })
        return
      }

      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)

      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    if (!title) {
      toast({
        title: "Title required",
        description: "Please provide a title for the document",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category for the document",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 500)

      // Check if we should use mock data
      if (useMockData) {
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 2000))
        clearInterval(progressInterval)
        setUploadProgress(100)
        setIsMockData(true)

        toast({
          title: "Document uploaded successfully (Mock)",
          description: "Your document has been uploaded and is being processed",
        })

        // Redirect to documents page after a short delay
        setTimeout(() => {
          router.push("/documents")
          router.refresh()
        }, 1500)

        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("category", category)
      formData.append("version", version)
      formData.append("description", description)

      const response = await apiClient.postFormData("/documents", formData)

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      setIsMockData(data.isMockData || false)
      setUploadProgress(100)

      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and is being processed",
      })

      // Redirect to documents page after a short delay
      setTimeout(() => {
        router.push("/documents")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Upload a document to be indexed and searchable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {useMockData && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Preview Mode</AlertTitle>
              <AlertDescription>You are in preview mode. Document uploads will be simulated.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, TXT, MD, DOC, DOCX. Maximum size: 10MB
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blueprints">Blueprints</SelectItem>
                  <SelectItem value="C++">C++</SelectItem>
                  <SelectItem value="Animation">Animation</SelectItem>
                  <SelectItem value="Rendering">Rendering</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="UI">UI</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Select value={version} onValueChange={setVersion} disabled={isUploading}>
                <SelectTrigger id="version">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UE 5.3">UE 5.3</SelectItem>
                  <SelectItem value="UE 5.2">UE 5.2</SelectItem>
                  <SelectItem value="UE 5.1">UE 5.1</SelectItem>
                  <SelectItem value="UE 5.0">UE 5.0</SelectItem>
                  <SelectItem value="UE 4.27">UE 4.27</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100 ? `Uploading and processing... ${uploadProgress}%` : "Processing complete!"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isUploading} className="w-full">
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
      </Card>
    </form>
  )
}
