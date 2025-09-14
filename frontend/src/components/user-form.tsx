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
import type { UserCreate, UserUpdate, UserRead } from "../types/api"
import { Role, Department, ClearanceDepartment } from "../types/api"

interface UserFormProps {
  user?: UserRead
  onSubmit: (data: UserCreate | UserUpdate) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  isEdit?: boolean
}

export function UserForm({ user, onSubmit, onCancel, isEdit = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    full_name: user?.full_name || "",
    role: user?.role || "user", // Updated default value to be a non-empty string
    department: user?.department || "none",
    clearance_department: user?.clearance_department || "none",
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
          username: formData.username || undefined,
          email: formData.email || undefined,
          full_name: formData.full_name || undefined,
          role: (formData.role as Role) || undefined,
          department: formData.department === "none" ? undefined : (formData.department as Department) || undefined,
          clearance_department: formData.clearance_department === "none" ? undefined : (formData.clearance_department as ClearanceDepartment) || undefined,
          password: formData.password || undefined,
        }
      : {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role as Role,
          department: formData.department === "none" ? undefined : (formData.department as Department) || undefined,
          clearance_department: formData.clearance_department === "none" ? undefined : (formData.clearance_department as ClearanceDepartment) || undefined,
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
        <CardTitle>{isEdit ? "Edit User" : "Create New User"}</CardTitle>
        <CardDescription>{isEdit ? "Update user information" : "Add a new user to the system"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required={!isEdit}
              disabled={loading}
            />
          </div>

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
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required={!isEdit}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              required={!isEdit}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Academic Department (Optional)</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Department</SelectItem>
                {Object.values(Department).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clearance_department">Clearance Department (For Staff)</Label>
            <Select
              value={formData.clearance_department}
              onValueChange={(value) => setFormData({ ...formData, clearance_department: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select clearance department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Clearance Department</SelectItem>
                {Object.values(ClearanceDepartment).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{isEdit ? "New Password (Optional)" : "Password"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!isEdit}
              disabled={loading}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update User" : "Create User"}
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
