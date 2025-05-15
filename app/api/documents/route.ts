import { NextResponse } from "next/server"
import { getDocuments, createDocument } from "@/lib/db"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET() {
  try {
    const { data, error } = await getDocuments()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents: data })
  } catch (error) {
    console.error("Error in GET /api/documents:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const { data, error } = await createDocument({ title, content })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ document: data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/documents:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
