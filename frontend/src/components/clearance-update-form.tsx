"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import { apiClient } from "../lib/api"
import { useAuth } from "../hooks/use-auth"
import type { ClearanceUpdate } from "../types/api"
import { ClearanceDepartment, ClearanceStatusEnum, Role } from "../types/api"

interface ClearanceUpdateFormProps {
  initialMatricNo?: string
  onSuccess?: () => void
}

export function ClearanceUpdateForm({ initialMatricNo = "", onSuccess }: ClearanceUpdateFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    matric_no: initialMatricNo,
    department: "",
    status: "",
    remarks: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Get available departments based on user role and permissions
  const getAvailableDepartments = () => {
    if (!user) return []
    
    // Admin can update any department
    if (user.role === Role.ADMIN) {
      return Object.values(ClearanceDepartment)
    }
    
    // Staff can only update their assigned clearance department
    if (user.role === Role.STAFF && user.clearance_department) {
      return [user.clearance_department]
    }
    
    // If staff has no assigned department, they can't update anything
    return []
  }

  const availableDepartments = getAvailableDepartments()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const updateData: ClearanceUpdate = {
        matric_no: formData.matric_no,
        department: formData.department as ClearanceDepartment,
        status: formData.status as ClearanceStatusEnum,
        remarks: formData.remarks || undefined,
      }

      await apiClient.put("/clearance/update", updateData)
      setSuccess("Clearance status updated successfully")
      setFormData({ ...formData, remarks: "" })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update clearance status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Clearance Status</CardTitle>
        <CardDescription>Update a student's clearance status for a specific department</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {user?.role === Role.STAFF && !user.clearance_department && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't have a clearance department assigned. Contact your administrator to assign you to a department before you can update clearance statuses.
              </AlertDescription>
            </Alert>
          )}

          {user?.role === Role.STAFF && user.clearance_department && (
            <Alert>
              <AlertDescription>
                You can only update clearance status for <strong>{user.clearance_department}</strong> department.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="matric_no">Matriculation Number</Label>
            <Input
              id="matric_no"
              value={formData.matric_no}
              onChange={(e) => setFormData({ ...formData, matric_no: e.target.value })}
              placeholder="e.g., 2021/CS/001"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              required
              disabled={loading || availableDepartments.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  availableDepartments.length === 0 
                    ? "No departments available" 
                    : "Select department"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              required
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ClearanceStatusEnum).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Add any additional comments..."
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || availableDepartments.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
