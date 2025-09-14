"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Loader2, Search, Unlink } from "lucide-react"
import { useRFID } from "../hooks/use-rfid"
import type { StudentReadWithClearance, UserRead } from "../types/api"
import { ClearanceStatusEnum } from "../types/api"

export function RFIDLookup() {
  const [tagId, setTagId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tagInfo, setTagInfo] = useState<{
    type: "student" | "user"
    data: StudentReadWithClearance | UserRead
  } | null>(null)
  const { getTagInfo, unlinkTag } = useRFID()

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagId.trim()) return

    setError("")
    setLoading(true)
    setTagInfo(null)

    const result = await getTagInfo(tagId.trim())

    if (result.success) {
      setTagInfo(result as any)
    } else {
      setError(result.error || "Tag not found or not linked")
    }

    setLoading(false)
  }

  const handleUnlink = async () => {
    if (!tagId.trim()) return

    if (confirm(`Are you sure you want to unlink tag ${tagId}?`)) {
      const result = await unlinkTag(tagId.trim())
      if (result.success) {
        setTagInfo(null)
        setTagId("")
        setError("")
      }
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
      <Card>
        <CardHeader>
          <CardTitle>RFID Tag Lookup</CardTitle>
          <CardDescription>Search for information about an RFID tag and its linked entity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="tag_id">RFID Tag ID</Label>
              <Input
                id="tag_id"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g., ABC123DEF456"
                disabled={loading}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading || !tagId.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Search className="mr-2 h-4 w-4" />
                Lookup Tag
              </Button>

              {tagInfo && (
                <Button type="button" variant="destructive" onClick={handleUnlink} disabled={loading}>
                  <Unlink className="mr-2 h-4 w-4" />
                  Unlink Tag
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {tagInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Tag Information</CardTitle>
            <CardDescription>
              Tag {tagId} is linked to a {tagInfo.type}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tagInfo.type === "student" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm text-muted-foreground">
                      {(tagInfo.data as StudentReadWithClearance).full_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Matriculation Number</Label>
                    <p className="text-sm text-muted-foreground">
                      {(tagInfo.data as StudentReadWithClearance).matric_no}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-muted-foreground">
                      {(tagInfo.data as StudentReadWithClearance).department}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Entity Type</Label>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Student
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Clearance Status</Label>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {(tagInfo.data as StudentReadWithClearance).clearance_statuses.map((status) => (
                      <div key={status.department} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{status.department}</span>
                        <Badge className={getStatusColor(status.status)} variant="outline">
                          {status.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tagInfo.type === "user" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm text-muted-foreground">{(tagInfo.data as UserRead).full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-sm text-muted-foreground">{(tagInfo.data as UserRead).username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{(tagInfo.data as UserRead).email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 capitalize">
                    {(tagInfo.data as UserRead).role}
                  </Badge>
                </div>
                {(tagInfo.data as UserRead).department && (
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-muted-foreground">{(tagInfo.data as UserRead).department}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Entity Type</Label>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    User
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
