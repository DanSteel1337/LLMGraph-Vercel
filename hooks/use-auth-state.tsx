"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Track auth subscription
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Clean up previous subscription
    if (authSubscription.current?.unsubscribe) {
      authSubscription.current.unsubscribe()
      authSubscription.current = null
    }

    // Initial session fetch
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.warn("Error fetching initial session:", error.message)
        }

        setSession(data.session)
        setUser(data.session?.user || null)
      } catch (error) {
        console.error("Failed to get initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Set up auth state listener
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      setLoading(false)
    })

    // Store subscription reference
    authSubscription.current = subscription

    return () => {
      // Clean up subscription
      if (authSubscription.current?.unsubscribe) {
        authSubscription.current.unsubscribe()
        authSubscription.current = null
      }
    }
  }, [])

  return { user, session, loading }
}
