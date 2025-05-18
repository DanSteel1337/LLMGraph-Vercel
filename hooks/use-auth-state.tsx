"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/provider"
import { useRouter } from "next/navigation"
import { logError } from "@/lib/error-handler"

export function useAuthState() {
  const { supabase, user, loading } = useSupabase()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false)
        setIsCheckingAdmin(false)
        return
      }

      try {
        const { data, error } = await supabase.from("admins").select("*").eq("user_id", user.id).single()

        if (error) {
          throw error
        }

        setIsAdmin(!!data)
      } catch (error) {
        logError(error, "admin_check_error")
        setIsAdmin(false)
      } finally {
        setIsCheckingAdmin(false)
      }
    }

    if (user) {
      checkAdminStatus()
    } else if (!loading) {
      setIsAdmin(false)
      setIsCheckingAdmin(false)
    }
  }, [user, loading, supabase])

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      logError(error, "sign_out_error")
      console.error("Error signing out:", error)
    }
  }

  return {
    user,
    loading: loading || isCheckingAdmin,
    isAdmin,
    signOut,
  }
}
