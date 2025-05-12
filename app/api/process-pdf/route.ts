import { type NextRequest, NextResponse } from "next/server"
import { extractTextFromPDFBuffer } from "@/lib/server-pdf-processor"

export async function POST(req: NextRequest) {
  try {
    // Get the PDF file from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract text from the PDF
    const text = await extractTextFromPDFBuffer(buffer)

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 })
  }
}
