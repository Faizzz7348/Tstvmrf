"use client"

import { PageLayout } from "@/components/page-layout"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function HomePage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger className="h-9 w-9" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Home</h1>
            <p className="text-sm text-muted-foreground">Dashboard utama</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="rounded-xl bg-muted/50 p-8">
            <h1 className="text-3xl font-bold mb-4">
              🏠 Selamat Datang di Home
            </h1>
            <p className="text-muted-foreground mb-4">
              Ini adalah halaman Home. Sidebar ini dibangun dengan shadcn/ui dan Radix UI.
            </p>
            <p className="text-muted-foreground mb-4">
              Sidebar ini memiliki fitur:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-8">
              <li>Overlay mode dengan backdrop blur</li>
              <li>Responsif - otomatis menjadi sheet di mobile</li>
              <li>Keyboard shortcut - tekan Ctrl/Cmd + B untuk toggle</li>
              <li>Menu dengan sub-menu</li>
              <li>Dark mode support</li>
              <li>Smooth animations</li>
            </ul>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">📊 Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Lihat statistik dan overview aplikasi Anda
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">📈 Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor performa dan metrics penting
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">⚡ Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Akses cepat ke fitur yang sering digunakan
                </p>
              </div>
            </div>
        </div>
      </div>
    </PageLayout>
  )
}
