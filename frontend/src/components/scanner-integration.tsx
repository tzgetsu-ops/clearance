"use client"

import { useState } from "react"
import { ScannerControl } from "./scanner-control"
import { RFIDLinkForm } from "./rfid-link-form"
import { RFIDLookup } from "./rfid-lookup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Scan, Link, Search, Info } from "lucide-react"

export function ScannerIntegration() {
  const [scannedTagId, setScannedTagId] = useState("")
  const [activeTab, setActiveTab] = useState("scanner")

  const handleTagScanned = (tagId: string) => {
    setScannedTagId(tagId)
    setActiveTab("link") // Switch to link tab when tag is scanned
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scanner Status</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Ready</div>
            <p className="text-xs text-muted-foreground">Activate to start scanning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Tags</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">Link</div>
            <p className="text-xs text-muted-foreground">Associate scanned tags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lookup</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Search</div>
            <p className="text-xs text-muted-foreground">Find tag information</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integration</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">Active</div>
            <p className="text-xs text-muted-foreground">Real-time scanning</p>
          </CardContent>
        </Card>
      </div>

      {scannedTagId && (
        <Alert>
          <Scan className="h-4 w-4" />
          <AlertDescription>
            <strong>Recently Scanned:</strong> {scannedTagId}
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
              Ready to Link
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="link">Link Tag</TabsTrigger>
          <TabsTrigger value="lookup">Lookup</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <ScannerControl onTagScanned={handleTagScanned} />
        </TabsContent>

        <TabsContent value="link" className="space-y-4">
          <RFIDLinkForm
            initialTagId={scannedTagId}
            onSuccess={() => {
              setScannedTagId("")
              setActiveTab("scanner")
            }}
          />
        </TabsContent>

        <TabsContent value="lookup" className="space-y-4">
          <RFIDLookup />
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Scanner Operations Guide
              </CardTitle>
              <CardDescription>How to use the RFID scanner system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Activate Scanner</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Select an available scanner device from the dropdown</li>
                  <li>Click "Activate Scanner" to start the scanning session</li>
                  <li>The system will poll for scanned tags every 2 seconds</li>
                  <li>Only active devices will appear in the selection list</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Scan RFID Tags</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Place RFID tags near the activated scanner device</li>
                  <li>Scanned tag IDs will appear automatically in the interface</li>
                  <li>The system will show the most recently scanned tag</li>
                  <li>You can clear scanned tags if needed</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Link or Lookup Tags</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Use "Use This Tag" to automatically fill the link form</li>
                  <li>The interface will switch to the Link tab automatically</li>
                  <li>Choose to link the tag to a student or user account</li>
                  <li>Use the Lookup tab to find existing tag associations</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Best Practices</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Always deactivate the scanner when finished to free up resources</li>
                  <li>Ensure scanner devices are properly configured and active</li>
                  <li>Verify tag associations after linking to confirm success</li>
                  <li>Use the real-time polling to streamline bulk tag operations</li>
                </ul>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Technical Note:</strong> The scanner system uses real-time polling every 2 seconds to detect
                  new tags. Make sure your network connection is stable for optimal performance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
