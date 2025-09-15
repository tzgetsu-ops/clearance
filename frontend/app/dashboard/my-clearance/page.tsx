"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../src/hooks/use-auth"
import { useStudents } from "../../../src/hooks/use-students"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Progress } from "../../../components/ui/progress"
import { Badge } from "../../../components/ui/badge"
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Role, ClearanceStatusEnum } from "../../../src/types/api"
import type { MyClearanceResponse } from "../../../src/types/api"

export default function MyClearancePage() {
  const { user } = useAuth()
  const { getMyClearance } = useStudents()
  const [clearanceData, setClearanceData] = useState<MyClearanceResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-fetch clearance data for authenticated student
  useEffect(() => {
    if (user && user.role === Role.STUDENT) {
      fetchMyClearance()
    }
  }, [user])

  const fetchMyClearance = async () => {
    setError("")
    setLoading(true)

    try {
      const result = await getMyClearance()

      if (result.success && result.data) {
        setClearanceData(result.data)
      } else {
        setError(result.error || "Failed to fetch your clearance data")
        setClearanceData(null)
      }
    } catch (err) {
      setError("An error occurred while fetching your clearance status")
      setClearanceData(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ClearanceStatusEnum.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case ClearanceStatusEnum.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />
      case ClearanceStatusEnum.PENDING:
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case ClearanceStatusEnum.APPROVED:
        return "default" as const // Success variant
      case ClearanceStatusEnum.REJECTED:
        return "destructive" as const
      case ClearanceStatusEnum.PENDING:
      default:
        return "secondary" as const
    }
  }

  const getOverallStatusMessage = (status: string) => {
    switch (status) {
      case "fully_cleared":
        return "Congratulations! You have completed all clearance requirements."
      case "partially_cleared":
        return "You have made progress. Some departments still require clearance."
      case "rejected":
        return "Some departments have rejected your clearance. Please address the issues and reapply."
      case "not_started":
        return "Your clearance process hasn't been initialized yet. Contact administration."
      case "pending":
      default:
        return "Your clearance is being processed. Check back later for updates."
    }
  }

  if (!user || user.role !== Role.STUDENT) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>You don't have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Clearance</h1>
          <p className="text-muted-foreground">Track your clearance status across all departments</p>
        </div>
        {clearanceData && (
          <Button onClick={fetchMyClearance} disabled={loading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>

      {loading && !clearanceData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Loading your clearance data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {clearanceData && (
        <div className="space-y-6">
          {/* Student Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold">{clearanceData.student_info.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matriculation Number</p>
                  <p className="text-lg font-semibold">{clearanceData.student_info.matric_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{clearanceData.student_info.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-lg">{clearanceData.student_info.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clearance Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Clearance Progress</CardTitle>
              <CardDescription>
                {getOverallStatusMessage(clearanceData.clearance_summary.overall_status)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {clearanceData.clearance_summary.approved_count} of {clearanceData.clearance_summary.total_departments} departments
                  </span>
                </div>
                <Progress value={clearanceData.clearance_summary.clearance_percentage} className="w-full" />
                <div className="flex justify-between text-sm">
                  <span>{clearanceData.clearance_summary.clearance_percentage.toFixed(1)}% Complete</span>
                  {clearanceData.clearance_summary.is_fully_cleared && (
                    <Badge variant="default">Fully Cleared</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clearanceData.department_statuses.map((departmentStatus) => (
              <Card key={departmentStatus.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{departmentStatus.department}</CardTitle>
                    {getStatusIcon(departmentStatus.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant={getStatusBadgeVariant(departmentStatus.status)}>
                      {departmentStatus.status.charAt(0).toUpperCase() + departmentStatus.status.slice(1)}
                    </Badge>
                    {departmentStatus.remarks && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Remarks:</p>
                        <p className="text-sm">{departmentStatus.remarks}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          {clearanceData.next_steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Departments that still require your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {clearanceData.next_steps.map((department, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{department}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
