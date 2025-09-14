"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../src/hooks/use-auth"
import { useStudents } from "../../../src/hooks/use-students"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { ClearanceProgress } from "../../../src/components/clearance-progress"
import { StudentInfoCard } from "../../../src/components/student-info-card"
import { Loader2, Search, RefreshCw } from "lucide-react"
import { Role } from "../../../src/types/api"
import type { StudentReadWithClearance } from "../../../src/types/api"

export default function MyClearancePage() {
  const { user } = useAuth()
  const { lookupStudent } = useStudents()
  const [matricNo, setMatricNo] = useState("")
  const [student, setStudent] = useState<StudentReadWithClearance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  // Auto-populate matric number if available from user profile
  useEffect(() => {
    if (user && user.role === Role.STUDENT) {
      // If the user object has a matric_no field, use it
      // Otherwise, the student will need to enter it manually
      const savedMatricNo = localStorage.getItem("student_matric_no")
      if (savedMatricNo) {
        setMatricNo(savedMatricNo)
        handleLookup(savedMatricNo)
      }
    }
  }, [user])

  const handleLookup = async (matric?: string) => {
    const matricToUse = matric || matricNo
    if (!matricToUse.trim()) {
      setError("Please enter your matriculation number")
      return
    }

    setError("")
    setLoading(true)
    setHasSearched(true)

    try {
      const result = await lookupStudent(matricToUse.trim())

      if (result.success && result.data) {
        setStudent(result.data)
        // Save matric number for future use
        localStorage.setItem("student_matric_no", matricToUse.trim())
      } else {
        setError(result.error || "Student record not found")
        setStudent(null)
      }
    } catch (err) {
      setError("An error occurred while fetching your clearance status")
      setStudent(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (matricNo) {
      handleLookup()
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
        {student && (
          <Button onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>

      {!student && (
        <Card>
          <CardHeader>
            <CardTitle>Access Your Clearance Status</CardTitle>
            <CardDescription>Enter your matriculation number to view your clearance progress</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleLookup()
              }}
              className="space-y-4"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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

              <Button type="submit" disabled={loading || !matricNo.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Search className="mr-2 h-4 w-4" />
                View My Clearance
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {student && (
        <div className="space-y-6">
          <StudentInfoCard student={student} />
          <ClearanceProgress student={student} />
        </div>
      )}

      {hasSearched && !student && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No clearance record found for this matriculation number.</p>
              <p className="text-sm text-muted-foreground">
                Please contact the administration office if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
