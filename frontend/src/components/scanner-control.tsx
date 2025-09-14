"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Loader2, Play, Square, Scan, Wifi, WifiOff } from "lucide-react"
import { useScanner } from "../hooks/use-scanner"

interface ScannerControlProps {
  onTagScanned?: (tagId: string) => void
}

export function ScannerControl({ onTagScanned }: ScannerControlProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const {
    isActive,
    activeDeviceId,
    scannedTag,
    loading,
    error,
    devices,
    activateScanner,
    deactivateScanner,
    clearScannedTag,
  } = useScanner()

  const handleActivate = async () => {
    if (!selectedDeviceId) return

    const result = await activateScanner(Number.parseInt(selectedDeviceId))
    if (!result.success) {
      console.error("Failed to activate scanner:", result.error)
    }
  }

  const handleDeactivate = () => {
    deactivateScanner()
    setSelectedDeviceId("")
  }

  const handleUseTag = () => {
    if (scannedTag) {
      onTagScanned?.(scannedTag)
      clearScannedTag()
    }
  }

  const activeDevice = devices.find((d) => d.id === activeDeviceId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scan className="mr-2 h-5 w-5" />
          Scanner Control
        </CardTitle>
        <CardDescription>Activate and manage RFID scanner devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isActive ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Scanner Device</label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a scanner device" />
                </SelectTrigger>
                <SelectContent>
                  {devices
                    .filter((device) => device.is_active)
                    .map((device) => (
                      <SelectItem key={device.id} value={device.id.toString()}>
                        {device.device_name} - {device.location}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleActivate} disabled={!selectedDeviceId || loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Play className="mr-2 h-4 w-4" />
              Activate Scanner
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Scanner Active</span>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>

            {activeDevice && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{activeDevice.device_name}</p>
                <p className="text-xs text-muted-foreground">
                  {activeDevice.location} • {activeDevice.department}
                </p>
              </div>
            )}

            {scannedTag ? (
              <div className="space-y-3">
                <Alert>
                  <Scan className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tag Detected:</strong> {scannedTag}
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-2">
                  <Button onClick={handleUseTag} className="flex-1">
                    Use This Tag
                  </Button>
                  <Button variant="outline" onClick={clearScannedTag}>
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="animate-pulse">
                  <Scan className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Waiting for RFID tag...</p>
                  <p className="text-xs text-muted-foreground mt-1">Place a tag near the scanner</p>
                </div>
              </div>
            )}

            <Button variant="destructive" onClick={handleDeactivate} className="w-full">
              <Square className="mr-2 h-4 w-4" />
              Deactivate Scanner
            </Button>
          </div>
        )}

        {devices.length === 0 && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>No scanner devices available. Please add devices from the Devices page.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
