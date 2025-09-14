"use client"

import { useState } from "react"
import { apiClient } from "../lib/api"
import type { StudentReadWithClearance, StudentCreate, StudentUpdate, StudentLookupBody, MyClearanceResponse } from "../types/api"

export function useStudents() {
  const [students, setStudents] = useState<StudentReadWithClearance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async (skip = 0, limit = 100) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<StudentReadWithClearance[]>("/admin/students/", { skip, limit })
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const createStudent = async (studentData: StudentCreate) => {
    try {
      const newStudent = await apiClient.post<StudentReadWithClearance>("/admin/students/", studentData)
      setStudents((prev) => [newStudent, ...prev])
      return { success: true, data: newStudent }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create student" }
    }
  }

  const updateStudent = async (studentId: number, studentData: StudentUpdate) => {
    try {
      const updatedStudent = await apiClient.put<StudentReadWithClearance>(`/admin/students/${studentId}`, studentData)
      setStudents((prev) => prev.map((s) => (s.id === studentId ? updatedStudent : s)))
      return { success: true, data: updatedStudent }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update student" }
    }
  }

  const deleteStudent = async (studentId: number) => {
    try {
      await apiClient.delete(`/admin/students/${studentId}`)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete student" }
    }
  }

  const lookupStudent = async (matricNo: string) => {
    try {
      const body: StudentLookupBody = {
        request: { matric_no: matricNo },
      }
      const student = await apiClient.post<StudentReadWithClearance>("/students/lookup", body)
      return { success: true, data: student }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Student not found" }
    }
  }

  const lookupStudentAdmin = async (matricNo?: string, tagId?: string) => {
    try {
      const params: Record<string, string> = {}
      if (matricNo) params.matric_no = matricNo
      if (tagId) params.tag_id = tagId

      const student = await apiClient.get<StudentReadWithClearance>("/admin/students/lookup", params)
      return { success: true, data: student }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Student not found" }
    }
  }

  const getMyClearance = async () => {
    try {
      const clearanceData = await apiClient.get<MyClearanceResponse>("/students/me/clearance")
      return { success: true, data: clearanceData }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to fetch your clearance data" }
    }
  }

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    lookupStudent,
    lookupStudentAdmin,
    getMyClearance,
  }
}
