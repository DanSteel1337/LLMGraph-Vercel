import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET() {
  try {
    const supabase = createClient()

    // Simple query to test connection
    const { data, error } = await supabase.from("documents").select("count(*)").single()

    if (error) {
      console.error("Database connection test failed:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data,
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
