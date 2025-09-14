"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Loader2, Search, Eye } from "lucide-react"
import { useStudents } from "../hooks/use-students"
import { useAuth } from "../hooks/use-auth"
import { StudentClearanceDetails } from "./student-clearance-details"
import type { StudentReadWithClearance } from "../types/api"
import { Role, ClearanceStatusEnum } from "../types/api"

interface StudentLookupProps {
  onStudentFound?: (student: StudentReadWithClearance) => void
}

export function StudentLookup({ onStudentFound }: StudentLookupProps) {
  const [matricNo, setMatricNo] = useState("")
  const [tagId, setTagId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [student, setStudent] = useState<StudentReadWithClearance | null>(null)
  const [showDetailedView, setShowDetailedView] = useState(false)
  const { lookupStudent, lookupStudentAdmin } = useStudents()
  const { user } = useAuth()

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matricNo.trim() && !tagId.trim()) {
      setError("Please enter either a matriculation number or tag ID")
      return
    }

    setError("")
    setLoading(true)
    setStudent(null)

    try {
      let result
      if (user?.role === Role.ADMIN || user?.role === Role.STAFF) {
        result = await lookupStudentAdmin(matricNo.trim() || undefined, tagId.trim() || undefined)
      } else {
        if (!matricNo.trim()) {
          setError("Students can only lookup by matriculation number")
          setLoading(false)
          return
        }
        result = await lookupStudent(matricNo.trim())
      }

      if (result.success && result.data) {
        setStudent(result.data)
        onStudentFound?.(result.data)
      } else {
        setError(result.error || "Student not found")
      }
    } catch (err) {
      setError("An error occurred during lookup")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ClearanceStatusEnum) => {
    switch (status) {
      case ClearanceStatusEnum.APPROVED:
        return "bg-green-100 text-green-800 border-green-200"
      case ClearanceStatusEnum.REJECTED:
        return "bg-red-100 text-red-800 border-red-200"
      case ClearanceStatusEnum.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {showDetailedView && student ? (
        <StudentClearanceDetails 
          student={student} 
          onClose={() => setShowDetailedView(false)} 
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Student Lookup</CardTitle>
              <CardDescription>
                {user?.role === Role.STUDENT
                  ? "Enter your matriculation number to view your clearance status"
                  : "Search for a student by matriculation number or RFID tag"}
              </CardDescription>
            </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="matric_no">Matriculation Number</Label>
                <Input
                  id="matric_no"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  placeholder="e.g., 2021/CS/001"
                  disabled={loading}
                />
              </div>

              {(user?.role === Role.ADMIN || user?.role === Role.STAFF) && (
                <div className="space-y-2">
                  <Label htmlFor="tag_id">RFID Tag ID</Label>
                  <Input
                    id="tag_id"
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    placeholder="e.g., ABC123"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading || (!matricNo.trim() && !tagId.trim())}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Search className="mr-2 h-4 w-4" />
              Search Student
            </Button>
          </form>
        </CardContent>
      </Card>

      {student && (
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm text-muted-foreground">{student.full_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Matriculation Number</Label>
                <p className="text-sm text-muted-foreground">{student.matric_no}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Department</Label>
                <p className="text-sm text-muted-foreground">{student.department}</p>
              </div>
              {student.rfid_tag && (
                <div>
                  <Label className="text-sm font-medium">RFID Tag</Label>
                  <p className="text-sm text-muted-foreground">{student.rfid_tag.tag_id}</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Clearance Status</Label>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {student.clearance_statuses.map((status) => (
                  <div key={status.department} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{status.department}</span>
                    <Badge className={getStatusColor(status.status)} variant="outline">
                      {status.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {student.clearance_statuses.some((s) => s.remarks) && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Remarks</Label>
                <div className="space-y-2">
                  {student.clearance_statuses
                    .filter((s) => s.remarks)
                    .map((status) => (
                      <div key={status.department} className="p-2 bg-muted rounded">
                        <p className="text-sm font-medium">{status.department}</p>
                        <p className="text-sm text-muted-foreground">{status.remarks}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailedView(true)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Detailed Status</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  )
}
