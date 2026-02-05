"use client"

import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactNode } from "react"

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

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="relative min-h-screen w-full">
          {/* Main content */}
          <div className="w-full min-h-screen page-transition">{children}</div>
          
          {/* Overlay backdrop */}
          <SidebarOverlay />
          
          {/* Floating sidebar */}
          <div className="fixed inset-y-0 left-0 z-50">
            <AppSidebar />
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
