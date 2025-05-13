"use client"

import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"

export function UploadButton() {
  return (
    <Link href="/upload">
      <Button className="gap-2">
        <Upload className="h-4 w-4" />
        Upload Document
      </Button>
    </Link>
  )
}
