"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Button } from "../../components/ui/button"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import type { StudentReadWithClearance } from "../types/api"
import { ClearanceStatusEnum, ClearanceDepartment } from "../types/api"

interface StudentClearanceDetailsProps {
  student: StudentReadWithClearance
  onClose: () => void
}

export function StudentClearanceDetails({ student, onClose }: StudentClearanceDetailsProps) {
  const calculateProgress = () => {
    if (student.clearance_statuses.length === 0) return 0
    
    const approved = student.clearance_statuses.filter(
      (status) => status.status === ClearanceStatusEnum.APPROVED
    ).length
    
    return Math.round((approved / student.clearance_statuses.length) * 100)
  }

  const getStatusIcon = (status: ClearanceStatusEnum) => {
    switch (status) {
      case ClearanceStatusEnum.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case ClearanceStatusEnum.REJECTED:
        return <XCircle className="h-4 w-4 text-red-600" />
      case ClearanceStatusEnum.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
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

  const getDepartmentStatuses = () => {
    // Get all departments and their current status
    const departmentMap = new Map()
    
    // Initialize all departments as "Not Started"
    Object.values(ClearanceDepartment).forEach(dept => {
      departmentMap.set(dept, {
        department: dept,
        status: "Not Started",
        comment: "No clearance record found",
        updated_at: null
      })
    })
    
    // Update with actual statuses
    student.clearance_statuses.forEach(clearanceStatus => {
      departmentMap.set(clearanceStatus.department, {
        department: clearanceStatus.department,
        status: clearanceStatus.status,
        comment: clearanceStatus.comment || "",
        updated_at: clearanceStatus.updated_at
      })
    })
    
    return Array.from(departmentMap.values())
  }

  const progress = calculateProgress()
  const departmentStatuses = getDepartmentStatuses()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clearance Details</h2>
          <p className="text-muted-foreground">
            {student.full_name} - {student.matric_no}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Student Info and Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Overall Clearance Progress
            <Badge variant="outline" className="text-lg px-3 py-1">
              {progress}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            {student.clearance_statuses.length} of {Object.values(ClearanceDepartment).length} departments processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Department Status Details */}
      <Card>
        <CardHeader>
          <CardTitle>Department Clearance Status</CardTitle>
          <CardDescription>
            Status breakdown by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {departmentStatuses.map((deptStatus) => (
              <Card key={deptStatus.department} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {deptStatus.department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(deptStatus.status as ClearanceStatusEnum)}
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(deptStatus.status as ClearanceStatusEnum)}
                      >
                        {deptStatus.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                {deptStatus.comment && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      <strong>Comment:</strong> {deptStatus.comment}
                    </p>
                    {deptStatus.updated_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(deptStatus.updated_at).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {student.clearance_statuses.filter(s => s.status === ClearanceStatusEnum.APPROVED).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {student.clearance_statuses.filter(s => s.status === ClearanceStatusEnum.PENDING).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {student.clearance_statuses.filter(s => s.status === ClearanceStatusEnum.REJECTED).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {Object.values(ClearanceDepartment).length - student.clearance_statuses.length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}