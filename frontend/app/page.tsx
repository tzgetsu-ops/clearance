"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Shield, Scan, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">COLENG</h1>
              <p className="text-xs text-muted-foreground">Clearance Portal</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container py-16">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="mb-4">
            College of Engineering
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Student Clearance
            <span className="text-primary"> Management System</span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Streamline your clearance process with our comprehensive RFID-enabled portal. Track progress, manage
            documents, and complete requirements efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard/my-clearance">Check My Status</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure Access</CardTitle>
              <CardDescription>
                Role-based authentication ensures secure access for students, staff, and administrators.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Scan className="h-8 w-8 text-primary mb-2" />
              <CardTitle>RFID Integration</CardTitle>
              <CardDescription>
                Advanced RFID scanning capabilities for quick student identification and tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Multi-Department</CardTitle>
              <CardDescription>
                Coordinate clearance across multiple departments with real-time status updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>
                Dedicated dashboard for students to track their clearance progress and requirements.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Quick Access</h2>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Students</CardTitle>
                <CardDescription>Check your clearance status and track progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/dashboard/my-clearance">View Status</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Staff</CardTitle>
                <CardDescription>Manage student records and clearance updates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/login">Staff Login</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Administrators</CardTitle>
                <CardDescription>Full system management and user administration</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <Link href="/login">Admin Login</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 College of Engineering. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
