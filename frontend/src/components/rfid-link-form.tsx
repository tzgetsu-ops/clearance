"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Loader2, Link } from "lucide-react"
import { useRFID } from "../hooks/use-rfid"
import type { TagLink } from "../types/api"

interface RFIDLinkFormProps {
  initialTagId?: string
  onSuccess?: () => void
}

export function RFIDLinkForm({ initialTagId = "", onSuccess }: RFIDLinkFormProps) {
  const [formData, setFormData] = useState({
    tag_id: initialTagId,
    link_type: "student", // "student" or "user"
    matric_no: "",
    username: "",
  })
  const [success, setSuccess] = useState("")
  const { linkTag, loading, error } = useRFID()

  useEffect(() => {
    if (initialTagId && initialTagId !== formData.tag_id) {
      setFormData((prev) => ({ ...prev, tag_id: initialTagId }))
      setSuccess("")
    }
  }, [initialTagId, formData.tag_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess("")

    const linkData: TagLink = {
      tag_id: formData.tag_id,
      matric_no: formData.link_type === "student" ? formData.matric_no || undefined : undefined,
      username: formData.link_type === "user" ? formData.username || undefined : undefined,
    }

    const result = await linkTag(linkData)

    if (result.success) {
      setSuccess(`Tag ${formData.tag_id} successfully linked to ${formData.link_type}`)
      setFormData({
        tag_id: "",
        link_type: "student",
        matric_no: "",
        username: "",
      })
      onSuccess?.()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link RFID Tag</CardTitle>
        <CardDescription>Link an RFID tag to a student or user account</CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="tag_id">RFID Tag ID</Label>
            <Input
              id="tag_id"
              value={formData.tag_id}
              onChange={(e) => setFormData({ ...formData, tag_id: e.target.value })}
              placeholder="e.g., ABC123DEF456"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Label>Link Type</Label>
            <RadioGroup
              value={formData.link_type}
              onValueChange={(value) => setFormData({ ...formData, link_type: value })}
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user">User (Staff/Admin)</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.link_type === "student" && (
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
          )}

          {formData.link_type === "user" && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g., admin123"
                required
                disabled={loading}
              />
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Link className="mr-2 h-4 w-4" />
            Link Tag
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
