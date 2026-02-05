"use client"

import { PageLayout } from "@/components/page-layout"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function CalendarPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger className="h-9 w-9" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Calendar</h1>
            <p className="text-sm text-muted-foreground">Jadwal dan event</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="rounded-xl bg-muted/50 p-8">
            <h1 className="text-3xl font-bold mb-4">
              📅 Calendar
            </h1>
            <p className="text-muted-foreground mb-6">
              Jadwal dan event Anda untuk bulan ini.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Event Hari Ini</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold">14:00</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Meeting dengan Klien</h4>
                      <p className="text-sm text-muted-foreground">Diskusi project baru</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold">16:30</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Team Standup</h4>
                      <p className="text-sm text-muted-foreground">Daily sync meeting</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Event Mendatang</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm font-bold">Besok</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Workshop Design</h4>
                      <p className="text-sm text-muted-foreground">09:00 - 12:00</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm font-bold">Jumat</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Product Review</h4>
                      <p className="text-sm text-muted-foreground">15:00 - 17:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </PageLayout>
  )
}
