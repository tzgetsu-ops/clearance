"use client"

import { useAuth } from "../../src/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Role } from "../../src/types/api"
import { Users, GraduationCap, CreditCard, Monitor } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-destructive text-destructive-foreground"
      case Role.STAFF:
        return "bg-secondary text-secondary-foreground"
      case Role.STUDENT:
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getWelcomeMessage = () => {
    switch (user.role) {
      case Role.ADMIN:
        return "Welcome to the admin dashboard. You have full access to manage students, users, devices, and RFID systems."
      case Role.STAFF:
        return "Welcome to the staff dashboard. You can manage students, update clearance statuses, and handle RFID operations."
      case Role.STUDENT:
        return "Welcome to your student portal. You can view your clearance status and track your progress."
      default:
        return "Welcome to the clearance portal."
    }
  }

  const getQuickActions = () => {
    const actions = []

    if (user.role === Role.ADMIN) {
      actions.push(
        {
          title: "Manage Students",
          description: "View and manage student records",
          icon: GraduationCap,
          href: "/dashboard/students",
        },
        {
          title: "Manage Users",
          description: "Create and manage system users",
          icon: Users,
          href: "/dashboard/users",
        },
        {
          title: "RFID Management",
          description: "Link and manage RFID tags",
          icon: CreditCard,
          href: "/dashboard/rfid",
        },
        {
          title: "Device Management",
          description: "Manage scanner devices",
          icon: Monitor,
          href: "/dashboard/devices",
        },
      )
    } else if (user.role === Role.STAFF) {
      actions.push(
        {
          title: "Manage Students",
          description: "View and update student clearance",
          icon: GraduationCap,
          href: "/dashboard/students",
        },
        {
          title: "RFID Operations",
          description: "Link and scan RFID tags",
          icon: CreditCard,
          href: "/dashboard/rfid",
        },
      )
    } else if (user.role === Role.STUDENT) {
      actions.push({
        title: "My Clearance",
        description: "View your clearance status",
        icon: GraduationCap,
        href: "/dashboard/my-clearance",
      })
    }

    return actions
  }

  const quickActions = getQuickActions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.full_name}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your current role and permissions</CardDescription>
            </div>
            <Badge className={getRoleColor(user.role)}>{user.role.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            {user.department && (
              <p className="text-sm">
                <span className="font-medium">Department:</span> {user.department}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-4">{getWelcomeMessage()}</p>
          </div>
        </CardContent>
      </Card>

      {quickActions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <action.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
