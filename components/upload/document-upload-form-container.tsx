"use client"

import { useRouter } from "next/navigation"
import { DocumentUploadForm } from "./document-upload-form"

export function DocumentUploadFormContainer() {
  const router = useRouter()

  return <DocumentUploadForm router={router} />
}
