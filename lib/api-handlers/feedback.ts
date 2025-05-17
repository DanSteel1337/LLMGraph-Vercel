/**
 * Feedback API Handlers
 * Centralizes all feedback-related API functionality
 */
import { createClient } from "@/lib/supabase/server"

// Get all feedback
export async function getAllFeedback() {
  try {
    const supabase = createClient()

    // Check if the feedback table exists
    const { error: tableCheckError } = await supabase.from("feedback").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      return {
        error: {
          message: "The feedback table does not exist in your database. Please create it using the SQL provided.",
          details: tableCheckError.message,
        },
      }
    }

    // If table exists, fetch the feedback
    const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching feedback:", error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error("Unexpected error in feedback route:", error)
    return {
      error: {
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
    }
  }
}

// Get feedback by ID
export async function getFeedbackById(id: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("feedback").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching feedback ${id}:`, error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error(`Error in getFeedbackById for ${id}:`, error)
    return { error }
  }
}

// Submit feedback
export async function submitFeedback(feedback: any) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("feedback").insert(feedback).select().single()

    if (error) {
      console.error("Error submitting feedback:", error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error("Error in submitFeedback:", error)
    return { error }
  }
}

// Update feedback
export async function updateFeedback(id: string, updates: any) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("feedback").update(updates).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating feedback ${id}:`, error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error(`Error in updateFeedback for ${id}:`, error)
    return { error }
  }
}

// Delete feedback
export async function deleteFeedback(id: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("feedback").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting feedback ${id}:`, error)
      return { error }
    }

    return { success: true }
  } catch (error) {
    console.error(`Error in deleteFeedback for ${id}:`, error)
    return { error }
  }
}

// Get feedback stats
export async function getFeedbackStats() {
  try {
    const supabase = createClient()

    // Get total feedback count
    const { count: totalCount, error: countError } = await supabase
      .from("feedback")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw countError
    }

    // Get feedback by rating
    const { data: ratingData, error: ratingError } = await supabase.from("feedback").select("rating")

    if (ratingError) {
      throw ratingError
    }

    // Calculate average rating and distribution
    let totalRating = 0
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    ratingData.forEach((item) => {
      const rating = item.rating
      if (rating >= 1 && rating <= 5) {
        totalRating += rating
        ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]++
      }
    })

    const averageRating = ratingData.length > 0 ? totalRating / ratingData.length : 0

    return {
      data: {
        totalCount: totalCount || 0,
        averageRating,
        ratingDistribution,
      },
    }
  } catch (error) {
    console.error("Error fetching feedback stats:", error)
    return { error }
  }
}
