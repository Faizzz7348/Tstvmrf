"use client"

import { Search as SearchIcon } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"

export default function SearchPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger className="h-9 w-9" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Search</h1>
            <p className="text-sm text-muted-foreground">Cari konten</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="rounded-xl bg-muted/50 p-8">
            <h1 className="text-3xl font-bold mb-4">
              🔍 Search
            </h1>
            <p className="text-muted-foreground mb-6">
              Cari dokumen, pesan, atau konten lainnya.
            </p>

            <div className="max-w-2xl mb-8">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari apapun..." 
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Hasil Pencarian Terbaru</h3>
                <div className="space-y-3">
                  <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
                    <h4 className="font-medium mb-1">Design System Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Panduan lengkap untuk menggunakan komponen UI...
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
                    <h4 className="font-medium mb-1">Meeting Notes - Q1 2026</h4>
                    <p className="text-sm text-muted-foreground">
                      Catatan dari meeting strategy planning...
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors cursor-pointer">
                    <h4 className="font-medium mb-1">Product Roadmap</h4>
                    <p className="text-sm text-muted-foreground">
                      Rencana pengembangan produk untuk 6 bulan ke depan...
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Kategori Populer</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 rounded-full border bg-card hover:bg-accent cursor-pointer">
                    📄 Dokumen
                  </div>
                  <div className="px-4 py-2 rounded-full border bg-card hover:bg-accent cursor-pointer">
                    👥 Tim
                  </div>
                  <div className="px-4 py-2 rounded-full border bg-card hover:bg-accent cursor-pointer">
                    📊 Project
                  </div>
                  <div className="px-4 py-2 rounded-full border bg-card hover:bg-accent cursor-pointer">
                    ⚙️ Settings
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </PageLayout>
  )
}
