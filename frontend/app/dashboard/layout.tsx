"use client"

import type React from "react"
import { AuthGuard } from "../../src/components/auth-guard"
import { DashboardSidebar } from "../../src/components/dashboard-sidebar"
import { DashboardHeader } from "../../src/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar border-r">
            <DashboardSidebar />
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
