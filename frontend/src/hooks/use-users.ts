"use client"

import { useState } from "react"
import { apiClient } from "../lib/api"
import type { UserRead, UserCreate, UserUpdate } from "../types/api"

export function useUsers() {
  const [users, setUsers] = useState<UserRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<UserRead[]>("/admin/users/")
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: UserCreate) => {
    try {
      const newUser = await apiClient.post<UserRead>("/admin/users/", userData)
      setUsers((prev) => [newUser, ...prev])
      return { success: true, data: newUser }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create user" }
    }
  }

  const updateUser = async (userId: number, userData: UserUpdate) => {
    try {
      const processedData = {
        ...userData,
        department: userData.department === "none" ? undefined : userData.department,
      }
      const updatedUser = await apiClient.put<UserRead>(`/admin/users/${userId}`, processedData)
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)))
      return { success: true, data: updatedUser }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update user" }
    }
  }

  const deleteUser = async (userId: number) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete user" }
    }
  }

  const lookupUser = async (username?: string, tagId?: string) => {
    try {
      const params: Record<string, string> = {}
      if (username) params.username = username
      if (tagId) params.tag_id = tagId

      const user = await apiClient.get<UserRead>("/admin/users/lookup", params)
      return { success: true, data: user }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "User not found" }
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    lookupUser,
  }
}
