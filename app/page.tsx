"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WelcomePage() {

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            👋 Selamat Datang!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Implementasi sidebar modern dengan shadcn/ui dan Radix UI
          </p>
        </div>
        
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 md:p-12 text-left shadow-2xl">
          <h2 className="text-3xl font-semibold mb-6 text-center">✨ Fitur Unggulan</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold mb-1">Overlay Mode</h3>
                  <p className="text-sm text-muted-foreground">Sidebar muncul di atas konten dengan backdrop blur</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-semibold mb-1">Responsif</h3>
                  <p className="text-sm text-muted-foreground">Otomatis adapt untuk mobile dan desktop</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⌨️</span>
                <div>
                  <h3 className="font-semibold mb-1">Keyboard Shortcut</h3>
                  <p className="text-sm text-muted-foreground">Tekan Ctrl/Cmd + B untuk toggle sidebar</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌓</span>
                <div>
                  <h3 className="font-semibold mb-1">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">Toggle antara light dan dark theme</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📂</span>
                <div>
                  <h3 className="font-semibold mb-1">Sub-menu</h3>
                  <p className="text-sm text-muted-foreground">Mendukung nested menu structure</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-semibold mb-1">Smooth Animations</h3>
                  <p className="text-sm text-muted-foreground">Transisi yang halus dan modern</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <Link href="/home">
            <Button size="lg" className="text-lg px-12 py-6 h-auto rounded-full shadow-lg hover:shadow-xl transition-all">
              Mulai Jelajahi →
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Klik tombol di atas untuk masuk ke aplikasi
          </p>
        </div>

        <div className="pt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>Built with Next.js</span>
          <span>•</span>
          <span>shadcn/ui</span>
          <span>•</span>
          <span>Tailwind CSS</span>
        </div>
      </div>
    </div>
  )
}
