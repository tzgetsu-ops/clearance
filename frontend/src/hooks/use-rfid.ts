"use client"

import { useState } from "react"
import { apiClient } from "../lib/api"
import type { RFIDTagRead, TagLink, StudentReadWithClearance, UserRead } from "../types/api"

export function useRFID() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const linkTag = async (tagData: TagLink) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.post<RFIDTagRead>("/admin/tags/link", tagData)
      return { success: true, data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to link tag"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const unlinkTag = async (tagId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.delete<RFIDTagRead>(`/admin/tags/${tagId}/unlink`)
      return { success: true, data: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to unlink tag"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const lookupTaggedStudent = async (tagId: string) => {
    try {
      const result = await apiClient.get<StudentReadWithClearance>("/admin/students/lookup", { tag_id: tagId })
      return { success: true, data: result }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Student not found" }
    }
  }

  const lookupTaggedUser = async (tagId: string) => {
    try {
      const result = await apiClient.get<UserRead>("/admin/users/lookup", { tag_id: tagId })
      return { success: true, data: result }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "User not found" }
    }
  }

  const getTagInfo = async (tagId: string) => {
    // Try to find what this tag is linked to
    const studentResult = await lookupTaggedStudent(tagId)
    if (studentResult.success) {
      return { success: true, type: "student", data: studentResult.data }
    }

    const userResult = await lookupTaggedUser(tagId)
    if (userResult.success) {
      return { success: true, type: "user", data: userResult.data }
    }

    return { success: false, error: "Tag not linked to any entity" }
  }

  return {
    loading,
    error,
    linkTag,
    unlinkTag,
    lookupTaggedStudent,
    lookupTaggedUser,
    getTagInfo,
  }
}
