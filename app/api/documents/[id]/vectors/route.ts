import { NextResponse } from "next/server"
import { getDocumentVectors } from "@/lib/pinecone-client"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const vectors = await getDocumentVectors(documentId)

    return NextResponse.json(vectors)
  } catch (error) {
    console.error("Error fetching document vectors:", error)
    return NextResponse.json({ error: "Failed to fetch document vectors" }, { status: 500 })
  }
}
