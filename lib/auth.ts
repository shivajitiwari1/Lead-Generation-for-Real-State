"use client"
import { useState, useEffect } from "react"
import { api } from "./api"
import type { User } from "./types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth.me()
      .then((res) => setUser((res as { data: User }).data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.auth.logout()
    setUser(null)
    window.location.href = "/login"
  }

  return { user, loading, logout }
}
