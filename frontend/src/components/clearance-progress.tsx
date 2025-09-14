"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import type { StudentReadWithClearance } from "../types/api"
import { ClearanceStatusEnum, ClearanceDepartment } from "../types/api"

interface ClearanceProgressProps {
  student: StudentReadWithClearance
}

export function ClearanceProgress({ student }: ClearanceProgressProps) {
  const allDepartments = Object.values(ClearanceDepartment)
  const statusMap = new Map(student.clearance_statuses.map((status) => [status.department, status]))

  const getStatusForDepartment = (department: ClearanceDepartment) => {
    return statusMap.get(department) || { department, status: ClearanceStatusEnum.PENDING, remarks: null }
  }

  const approvedCount = student.clearance_statuses.filter((s) => s.status === ClearanceStatusEnum.APPROVED).length
  const rejectedCount = student.clearance_statuses.filter((s) => s.status === ClearanceStatusEnum.REJECTED).length
  const pendingCount = allDepartments.length - approvedCount - rejectedCount

  const progressPercentage = (approvedCount / allDepartments.length) * 100

  const getStatusIcon = (status: ClearanceStatusEnum) => {
    switch (status) {
      case ClearanceStatusEnum.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case ClearanceStatusEnum.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />
      case ClearanceStatusEnum.PENDING:
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
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

  const getOverallStatus = () => {
    if (rejectedCount > 0) return { status: "Issues Found", color: "text-red-600" }
    if (approvedCount === allDepartments.length) return { status: "Completed", color: "text-green-600" }
    return { status: "In Progress", color: "text-yellow-600" }
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Clearance Progress</span>
            <Badge variant="outline" className={`${overallStatus.color} border-current`}>
              {overallStatus.status}
            </Badge>
          </CardTitle>
          <CardDescription>Your current clearance status across all departments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {approvedCount} of {allDepartments.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <div className="text-xs text-muted-foreground">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allDepartments.map((department) => {
          const departmentStatus = getStatusForDepartment(department)
          return (
            <Card key={department} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{department}</CardTitle>
                  {getStatusIcon(departmentStatus.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getStatusColor(departmentStatus.status)} variant="outline">
                  {departmentStatus.status.toUpperCase()}
                </Badge>

                {departmentStatus.remarks && (
                  <div className="p-2 bg-muted rounded text-sm">
                    <p className="font-medium text-muted-foreground mb-1">Remarks:</p>
                    <p>{departmentStatus.remarks}</p>
                  </div>
                )}

                {departmentStatus.status === ClearanceStatusEnum.PENDING && (
                  <p className="text-xs text-muted-foreground">Awaiting review from {department}</p>
                )}

                {departmentStatus.status === ClearanceStatusEnum.REJECTED && (
                  <p className="text-xs text-red-600">Action required - please contact {department}</p>
                )}

                {departmentStatus.status === ClearanceStatusEnum.APPROVED && (
                  <p className="text-xs text-green-600">Clearance approved by {department}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Next Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>What you need to do to complete your clearance</CardDescription>
        </CardHeader>
        <CardContent>
          {rejectedCount > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-600">Action Required:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {student.clearance_statuses
                  .filter((s) => s.status === ClearanceStatusEnum.REJECTED)
                  .map((status) => (
                    <li key={status.department} className="flex items-start space-x-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Contact <strong>{status.department}</strong> to resolve issues
                        {status.remarks && `: ${status.remarks}`}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : approvedCount === allDepartments.length ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Congratulations! Your clearance is complete.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Pending Departments:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {allDepartments
                  .filter((dept) => {
                    const status = getStatusForDepartment(dept)
                    return status.status === ClearanceStatusEnum.PENDING
                  })
                  .map((department) => (
                    <li key={department} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>
                        Awaiting clearance from <strong>{department}</strong>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
