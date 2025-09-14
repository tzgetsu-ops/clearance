"use client"

import { useState, useEffect } from "react"
import type { UserRead, LoginRequest } from "../types/api"
import { apiClient } from "../lib/api"

export function useAuth() {
  const [user, setUser] = useState<UserRead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      console.log("[v0] Initializing authentication...")
      const token = localStorage.getItem("access_token")
      const savedUser = localStorage.getItem("user")

      if (token && savedUser) {
        try {
          console.log("[v0] Found saved token and user, verifying...")
          setUser(JSON.parse(savedUser))
          // Verify token is still valid
          const currentUser = await apiClient.getCurrentUser()
          console.log("[v0] Token verified, user:", currentUser)
          setUser(currentUser)
          localStorage.setItem("user", JSON.stringify(currentUser))
        } catch (error) {
          console.log("[v0] Token verification failed:", error)
          // Token is invalid, clear storage
          localStorage.removeItem("access_token")
          localStorage.removeItem("user")
          setUser(null)
        }
      } else {
        console.log("[v0] No saved token or user found")
      }
      setLoading(false)
      console.log("[v0] Authentication initialization complete")
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      console.log("[v0] Attempting login for:", credentials.username)
      const tokenResponse = await apiClient.login(credentials)
      console.log("[v0] Login successful, got token")
      localStorage.setItem("access_token", tokenResponse.access_token)

      const user = await apiClient.getCurrentUser()
      console.log("[v0] Got user data:", user)
      localStorage.setItem("user", JSON.stringify(user))
      setUser(user)

      return { success: true }
    } catch (error) {
      console.log("[v0] Login failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/login"
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
