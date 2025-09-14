"use client"

import { useState } from "react"
import { useAuth } from "../../../src/hooks/use-auth"
import { RFIDLinkForm } from "../../../src/components/rfid-link-form"
import { RFIDLookup } from "../../../src/components/rfid-lookup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Role } from "../../../src/types/api"
import { CreditCard, Search, Link, Info } from "lucide-react"

export default function RFIDPage() {
  const { user } = useAuth()
  const [scannedTagId, setScannedTagId] = useState("")

  if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>You don't have permission to access RFID management.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RFID Management</h1>
        <p className="text-muted-foreground">Manage RFID tags and their associations with students and users</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Tags</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Link</div>
            <p className="text-xs text-muted-foreground">Associate tags with entities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lookup Tags</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Search</div>
            <p className="text-xs text-muted-foreground">Find tag associations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scanner Ready</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Ready</div>
            <p className="text-xs text-muted-foreground">Scanner integration active</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="link" className="space-y-4">
        <TabsList>
          <TabsTrigger value="link">Link Tag</TabsTrigger>
          <TabsTrigger value="lookup">Lookup Tag</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          <RFIDLinkForm initialTagId={scannedTagId} onSuccess={() => setScannedTagId("")} />
        </TabsContent>

        <TabsContent value="lookup" className="space-y-4">
          <RFIDLookup />
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                RFID System Information
              </CardTitle>
              <CardDescription>How to use the RFID management system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Linking Tags</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use the "Link Tag" tab to associate RFID tags with students or users</li>
                  <li>
                    Enter the tag ID and select whether to link to a student (by matric number) or user (by username)
                  </li>
                  <li>Tags can be linked to either students or staff/admin users</li>
                  <li>Each tag can only be linked to one entity at a time</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Looking Up Tags</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use the "Lookup Tag" tab to find what entity a tag is linked to</li>
                  <li>Enter the tag ID to see student or user information</li>
                  <li>You can unlink tags from this interface if needed</li>
                  <li>Student clearance status is displayed for linked student tags</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Scanner Integration</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use the Scanner page to activate RFID scanners</li>
                  <li>Scanned tags will automatically populate the link form</li>
                  <li>Real-time scanning helps streamline the linking process</li>
                  <li>Multiple scanner devices can be managed from the Devices page</li>
                </ul>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Only Admin and Staff users can manage RFID tags. Students can view their own
                  linked tag information through the student lookup system.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
