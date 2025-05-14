import { NextResponse } from "next/server"
import { getDocumentChunks } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const chunks = await getDocumentChunks(documentId)

    return NextResponse.json(chunks)
  } catch (error) {
    console.error("Error fetching document chunks:", error)
    return NextResponse.json({ error: "Failed to fetch document chunks" }, { status: 500 })
  }
}
