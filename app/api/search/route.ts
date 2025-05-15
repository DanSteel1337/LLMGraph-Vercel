import { NextResponse } from "next/server"
import { searchDocuments } from "@/lib/db"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter q is required" }, { status: 400 })
    }

    const { data, error } = await searchDocuments(query)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ results: data })
  } catch (error) {
    console.error("Error in GET /api/search:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
