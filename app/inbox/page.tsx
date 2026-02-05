"use client"

import { PageLayout } from "@/components/page-layout"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function InboxPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger className="h-9 w-9" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Inbox</h1>
            <p className="text-sm text-muted-foreground">Pesan dan notifikasi</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="rounded-xl bg-muted/50 p-8">
            <h1 className="text-3xl font-bold mb-4">
              📨 Inbox
            </h1>
            <p className="text-muted-foreground mb-6">
              Kelola pesan dan notifikasi Anda di sini.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Pesan Baru dari Tim Marketing</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Update terbaru tentang kampanye produk Q1 2026...
                    </p>
                    <span className="text-xs text-muted-foreground">2 jam yang lalu</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Reminder: Meeting Hari Ini</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Jangan lupa meeting dengan klien pukul 14.00...
                    </p>
                    <span className="text-xs text-muted-foreground">5 jam yang lalu</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer opacity-60">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Task Completed</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Project Design Engineering telah selesai...
                    </p>
                    <span className="text-xs text-muted-foreground">Kemarin</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </PageLayout>
  )
}
