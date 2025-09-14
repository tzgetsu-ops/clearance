"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { User, GraduationCap, CreditCard } from "lucide-react"
import type { StudentReadWithClearance } from "../types/api"

interface StudentInfoCardProps {
  student: StudentReadWithClearance
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Student Information
        </CardTitle>
        <CardDescription>Your personal details and account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Full Name</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{student.full_name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Matriculation Number</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{student.matric_no}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Department</span>
            </div>
            <Badge variant="outline" className="ml-6">
              {student.department}
            </Badge>
          </div>

          {student.rfid_tag && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">RFID Tag</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6 font-mono">{student.rfid_tag.tag_id}</p>
            </div>
          )}
        </div>

        {!student.rfid_tag && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">No RFID Tag Linked</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Contact the administration office to link your RFID card for faster access.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
