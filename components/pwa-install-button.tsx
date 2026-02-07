'use client'

import { usePWAInstall } from '@/hooks/use-pwa-install'
import { Button } from '@/components/ui/button'
import { Download, Check } from 'lucide-react'

/**
 * PWA Install Button Component
 * Shows install prompt when app is installable
 */
export function PWAInstallButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall()

  // Don't show button if already installed
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4" />
        <span>App installed</span>
      </div>
    )
  }

  // Don't show button if not installable
  if (!isInstallable) {
    return null
  }

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) {
      console.log('PWA installation accepted')
    } else {
      console.log('PWA installation dismissed')
    }
  }

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
}
