"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../src/hooks/use-auth"
import { useStudents } from "../../../src/hooks/use-students"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { StudentForm } from "../../../src/components/student-form"
import { StudentLookup } from "../../../src/components/student-lookup"
import { ClearanceUpdateForm } from "../../../src/components/clearance-update-form"
import { StudentClearanceDetails } from "../../../src/components/student-clearance-details"
import { Plus, Search, Edit, Trash2, Loader2, Eye } from "lucide-react"
import { Role, ClearanceStatusEnum } from "../../../src/types/api"
import type { StudentReadWithClearance } from "../../../src/types/api"

export default function StudentsPage() {
  const { user } = useAuth()
  const { students, loading, error, fetchStudents, createStudent, updateStudent, deleteStudent } = useStudents()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentReadWithClearance | null>(null)
  const [viewingStudent, setViewingStudent] = useState<StudentReadWithClearance | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentReadWithClearance | null>(null)

  useEffect(() => {
    if (user?.role === Role.ADMIN || user?.role === Role.STAFF) {
      fetchStudents()
    }
  }, [user])

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matric_no.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateStudent = async (data: any) => {
    const result = await createStudent(data)
    if (result.success) {
      setShowCreateForm(false)
    }
    return result
  }

  const handleUpdateStudent = async (data: any) => {
    if (!editingStudent) return { success: false, error: "No student selected" }
    const result = await updateStudent(editingStudent.id, data)
    if (result.success) {
      setEditingStudent(null)
    }
    return result
  }

  const handleDeleteStudent = async (student: StudentReadWithClearance) => {
    if (confirm(`Are you sure you want to delete ${student.full_name}?`)) {
      await deleteStudent(student.id)
    }
  }

  const getOverallStatus = (student: StudentReadWithClearance) => {
    if (student.clearance_statuses.length === 0) return "No Status"

    const approved = student.clearance_statuses.filter((s) => s.status === ClearanceStatusEnum.APPROVED).length
    const rejected = student.clearance_statuses.filter((s) => s.status === ClearanceStatusEnum.REJECTED).length
    const total = student.clearance_statuses.length

    if (rejected > 0) return "Rejected"
    if (approved === total) return "Completed"
    return "In Progress"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (user?.role === Role.STUDENT) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Lookup</h1>
          <p className="text-muted-foreground">Look up your clearance status</p>
        </div>
        <StudentLookup />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {viewingStudent ? (
        <StudentClearanceDetails 
          student={viewingStudent} 
          onClose={() => setViewingStudent(null)} 
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground">Manage student records and clearance status</p>
            </div>
            {user?.role === Role.ADMIN && (
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Student</DialogTitle>
                    <DialogDescription>Add a new student to the system</DialogDescription>
                  </DialogHeader>
                  <StudentForm onSubmit={handleCreateStudent} onCancel={() => setShowCreateForm(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StudentLookup onStudentFound={setSelectedStudent} />
            <ClearanceUpdateForm initialMatricNo={selectedStudent?.matric_no} onSuccess={() => fetchStudents()} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
              <CardDescription>Complete list of registered students - Click on a student to view detailed clearance status</CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Matric No</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>RFID Tag</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setViewingStudent(student)}
                      >
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.matric_no}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getOverallStatus(student))} variant="outline">
                            {getOverallStatus(student)}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.rfid_tag?.tag_id || "Not Linked"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewingStudent(student)
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user?.role === Role.ADMIN && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingStudent(student)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteStudent(student)
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {editingStudent && (
            <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Student</DialogTitle>
                  <DialogDescription>Update student information</DialogDescription>
                </DialogHeader>
                <StudentForm
                  student={editingStudent}
                  onSubmit={handleUpdateStudent}
                  onCancel={() => setEditingStudent(null)}
                  isEdit
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  )
}
