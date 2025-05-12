"use client"

import { useAuth } from "@/lib/auth"

export function AuthDebug() {
  const { user, session, isLoading } = useAuth()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs max-w-xs overflow-auto">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>
        <p>Loading: {isLoading ? "true" : "false"}</p>
        <p>User: {user ? user.email : "null"}</p>
        <p>Session: {session ? "exists" : "null"}</p>
      </div>
    </div>
  )
}
