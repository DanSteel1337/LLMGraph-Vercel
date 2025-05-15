import { NextResponse } from "next/server"
import { getDocumentById, updateDocument, deleteDocument } from "@/lib/db"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { data, error } = await getDocumentById(id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes("not found") ? 404 : 500 })
    }

    return NextResponse.json({ document: data })
  } catch (error) {
    console.error(`Error in GET /api/documents/${params.id}:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { title, content } = body

    if (!title && !content) {
      return NextResponse.json({ error: "At least one of title or content is required" }, { status: 400 })
    }

    const { data, error } = await updateDocument(id, { title, content })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes("not found") ? 404 : 500 })
    }

    return NextResponse.json({ document: data })
  } catch (error) {
    console.error(`Error in PUT /api/documents/${params.id}:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { error } = await deleteDocument(id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes("not found") ? 404 : 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`Error in DELETE /api/documents/${params.id}:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
