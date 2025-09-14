"use client"

import type React from "react"

import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { ScrollArea } from "../../components/ui/scroll-area"
import { useAuth } from "../hooks/use-auth"
import { Role } from "../types/api"
import { Users, GraduationCap, CreditCard, Scan, Monitor, BarChart3, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardSidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Overview",
        href: "/dashboard",
        icon: BarChart3,
        roles: [Role.ADMIN, Role.STAFF, Role.STUDENT],
      },
    ]

    if (user.role === Role.ADMIN) {
      return [
        ...baseItems,
        {
          title: "Students",
          href: "/dashboard/students",
          icon: GraduationCap,
          roles: [Role.ADMIN],
        },
        {
          title: "Users",
          href: "/dashboard/users",
          icon: Users,
          roles: [Role.ADMIN],
        },
        {
          title: "RFID",
          href: "/dashboard/rfid",
          icon: CreditCard,
          roles: [Role.ADMIN],
        },
        {
          title: "Devices",
          href: "/dashboard/devices",
          icon: Monitor,
          roles: [Role.ADMIN],
        },
        {
          title: "Scanner",
          href: "/dashboard/scanner",
          icon: Scan,
          roles: [Role.ADMIN],
        },
      ]
    }

    if (user.role === Role.STAFF) {
      return [
        ...baseItems,
        {
          title: "Students",
          href: "/dashboard/students",
          icon: GraduationCap,
          roles: [Role.STAFF],
        },
        {
          title: "RFID",
          href: "/dashboard/rfid",
          icon: CreditCard,
          roles: [Role.STAFF],
        },
        {
          title: "Scanner",
          href: "/dashboard/scanner",
          icon: Scan,
          roles: [Role.STAFF],
        },
      ]
    }

    if (user.role === Role.STUDENT) {
      return [
        ...baseItems,
        {
          title: "My Clearance",
          href: "/dashboard/my-clearance",
          icon: User,
          roles: [Role.STUDENT],
        },
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-2 px-4 text-lg font-semibold tracking-tight text-primary">COLENG</div>
          <div className="px-4 text-sm text-muted-foreground">University Clearance Portal</div>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            <ScrollArea className="h-[300px]">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </ScrollArea>
          </div>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            <div className="px-4 py-2 text-sm text-muted-foreground">Signed in as {user.full_name}</div>
            <div className="px-4 py-1 text-xs text-muted-foreground capitalize">
              {user.role} • {user.department || "No Department"}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
