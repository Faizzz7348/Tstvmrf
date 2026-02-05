"use client"

import { useState } from "react"
import { Info, MapPin, Navigation, QrCode, Plus, Trash2, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Description {
  id: string
  text: string
}

interface InfoModalProps {
  title?: string
  defaultDescriptions?: string[]
  lat?: string
  lng?: string
  onGenerateQR?: () => void
  triggerVariant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
  triggerClassName?: string
  isEditMode?: boolean
}

export function InfoModal({
  title = "Maklumat",
  defaultDescriptions = [],
  lat = "",
  lng = "",
  onGenerateQR,
  triggerVariant = "outline",
  triggerClassName = "",
  isEditMode = false,
}: InfoModalProps) {
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [navigationType, setNavigationType] = useState<"google" | "waze" | null>(null)
  const [descriptions, setDescriptions] = useState<Description[]>(
    defaultDescriptions.map((text, index) => ({
      id: `desc-${index}`,
      text,
    }))
  )

  const addDescription = () => {
    const text = prompt("Masukkan penerangan baru:")
    if (text && text.trim()) {
      const newDescription: Description = {
        id: `desc-${Date.now()}`,
        text: text.trim(),
      }
      setDescriptions([...descriptions, newDescription])
    }
  }

  const updateDescription = (id: string, text: string) => {
    setDescriptions(
      descriptions.map((desc) =>
        desc.id === id ? { ...desc, text } : desc
      )
    )
  }

  const removeDescription = (id: string) => {
    setDescriptions(descriptions.filter((desc) => desc.id !== id))
  }

  const handleGoogleMaps = () => {
    if (lat && lng) {
      setNavigationType("google")
      setShowConfirmation(true)
    }
  }

  const handleWaze = () => {
    if (lat && lng) {
      setNavigationType("waze")
      setShowConfirmation(true)
    }
  }

  const confirmNavigation = () => {
    if (navigationType === "google") {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank")
    } else if (navigationType === "waze") {
      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, "_blank")
    }
    setShowConfirmation(false)
    setNavigationType(null)
  }

  const cancelNavigation = () => {
    setShowConfirmation(false)
    setNavigationType(null)
  }

  const handleQRCode = () => {
    if (onGenerateQR) {
      onGenerateQR()
    } else {
      console.log("Generate QR Code")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="icon" className={triggerClassName || "h-8 w-8"}>
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Tambah dan urus maklumat. Klik button di bawah untuk navigasi."
              : "Maklumat lokasi. Klik button di bawah untuk navigasi."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Description Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Penerangan</h3>
              {isEditMode && (
                <Button
                  onClick={addDescription}
                  size="sm"
                  variant="outline"
                  className="h-8 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/30 transition-all"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              )}
            </div>

            {descriptions.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isEditMode 
                    ? 'Tiada penerangan. Klik "Tambah" untuk menambah.'
                    : 'Tiada penerangan tersedia.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {descriptions.map((desc, index) => (
                  <div key={desc.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-muted transition-all duration-200 group">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center text-xs font-semibold group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div className="flex-1 text-sm leading-relaxed">
                      {desc.text}
                    </div>
                    {isEditMode && (
                      <Button
                        onClick={() => removeDescription(desc.id)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Buttons Section */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Navigasi & Aksi</h3>
            <div className={`grid gap-3 ${lat && lng ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {lat && lng && (
                <>
                  <Button
                    onClick={handleGoogleMaps}
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 transition-all duration-200 group"
                  >
                    <MapPin className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Google Maps</span>
                  </Button>
                  
                  <Button
                    onClick={handleWaze}
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 hover:bg-cyan-50 hover:border-cyan-300 dark:hover:bg-cyan-950/30 transition-all duration-200 group"
                  >
                    <Navigation className="h-5 w-5 text-cyan-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Waze</span>
                  </Button>
                </>
              )}
              
              <Button
                onClick={handleQRCode}
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/30 transition-all duration-200 group"
              >
                <QrCode className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">QR Code</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {navigationType === "google" ? (
                <>
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <span>Buka Google Maps?</span>
                </>
              ) : (
                <>
                  <Navigation className="h-6 w-6 text-cyan-600" />
                  <span>Buka Waze?</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-2">
              Anda akan dibawa ke {navigationType === "google" ? "Google Maps" : "Waze"} untuk navigasi ke lokasi ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Koordinat:</span>
                <span className="font-mono font-semibold text-sm bg-background px-3 py-1 rounded-md">{lat}, {lng}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Platform:</span>
                <div className="flex items-center gap-2">
                  {navigationType === "google" ? (
                    <>
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-600">Google Maps</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 text-cyan-600" />
                      <span className="font-semibold text-cyan-600">Waze</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
              <ExternalLink className="h-3 w-3" />
              <span>Tab baru akan dibuka dalam browser anda</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={cancelNavigation}
              className="hover:bg-muted transition-all"
            >
              Batal
            </Button>
            <Button 
              onClick={confirmNavigation}
              className={`${navigationType === "google" 
                ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30" 
                : "bg-cyan-600 hover:bg-cyan-700 hover:shadow-lg hover:shadow-cyan-500/30"
              } transition-all duration-200`}
            >
              {navigationType === "google" ? (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Buka Google Maps
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Buka Waze
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
