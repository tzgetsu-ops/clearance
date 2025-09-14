"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Loader2 } from "lucide-react"
import type { StudentCreate, StudentUpdate, StudentReadWithClearance } from "../types/api"
import { Department } from "../types/api"

interface StudentFormProps {
  student?: StudentReadWithClearance
  onSubmit: (data: StudentCreate | StudentUpdate) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  isEdit?: boolean
}

export function StudentForm({ student, onSubmit, onCancel, isEdit = false }: StudentFormProps) {
  const [formData, setFormData] = useState({
    full_name: student?.full_name || "",
    matric_no: student?.matric_no || "",
    email: student?.email || "",
    department: student?.department || "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const submitData = isEdit
      ? {
          full_name: formData.full_name || undefined,
          department: (formData.department as Department) || undefined,
          email: formData.email || undefined,
        }
      : {
          full_name: formData.full_name,
          matric_no: formData.matric_no,
          email: formData.email,
          department: formData.department as Department,
          password: formData.password,
        }

    const result = await onSubmit(submitData)

    if (result.success) {
      onCancel() // Close form on success
    } else {
      setError(result.error || "Operation failed")
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Student" : "Create New Student"}</CardTitle>
        <CardDescription>{isEdit ? "Update student information" : "Add a new student to the system"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required={!isEdit}
              disabled={loading}
            />
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="matric_no">Matriculation Number</Label>
              <Input
                id="matric_no"
                value={formData.matric_no}
                onChange={(e) => setFormData({ ...formData, matric_no: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required={!isEdit}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              required={!isEdit}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Department).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Student" : "Create Student"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
