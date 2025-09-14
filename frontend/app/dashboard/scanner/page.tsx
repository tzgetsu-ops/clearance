"use client"

import { useAuth } from "../../../src/hooks/use-auth"
import { ScannerIntegration } from "../../../src/components/scanner-integration"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Role } from "../../../src/types/api"

export default function ScannerPage() {
  const { user } = useAuth()

  if (!user || (user.role !== Role.ADMIN && user.role !== Role.STAFF)) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>You don't have permission to access scanner operations.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scanner Operations</h1>
        <p className="text-muted-foreground">Activate RFID scanners and manage real-time tag scanning operations</p>
      </div>

      <ScannerIntegration />
    </div>
  )
}
