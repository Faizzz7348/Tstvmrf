"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"

function SidebarOverlay() {
  const { open, setOpen } = useSidebar()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={() => setOpen(false)}
    />
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full">
        {/* Main content */}
        <div className="w-full">{children}</div>
        
        {/* Overlay backdrop */}
        <SidebarOverlay />
        
        {/* Floating sidebar */}
        <div className="fixed inset-y-0 left-0 z-50">
          <AppSidebar />
        </div>
      </div>
    </SidebarProvider>
  )
}
