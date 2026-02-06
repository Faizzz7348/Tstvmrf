"use client"

import { useState, useRef, useCallback } from "react"
import { Info, MapPin, Navigation, QrCode, Plus, Trash2, ExternalLink, Upload, Link2, Image as ImageIcon, X, Eye, Pencil, Loader2, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
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
import { scanQrFromImage } from "@/lib/qr-scanner"

interface Description {
  id: string
  text: string
}

interface QrCodeImage {
  id: number
  imageUrl: string
  destinationUrl: string
  title: string
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
  qrCodeImages?: QrCodeImage[]
  onQrCodeImagesChange?: (images: QrCodeImage[]) => void
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
  qrCodeImages: externalQrCodeImages,
  onQrCodeImagesChange,
}: InfoModalProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showQRConfirmation, setShowQRConfirmation] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [navigationType, setNavigationType] = useState<"google" | "waze" | null>(null)
  const [qrUrlToOpen, setQrUrlToOpen] = useState<string | null>(null)
  const [descriptions, setDescriptions] = useState<Description[]>(
    defaultDescriptions.map((text, index) => ({
      id: `desc-${index}`,
      text,
    }))
  )

  // QR Code state
  const [internalQrCodeImages, setInternalQrCodeImages] = useState<QrCodeImage[]>(externalQrCodeImages || [])
  const qrCodeImages = externalQrCodeImages ?? internalQrCodeImages
  const [newQrDestinationUrl, setNewQrDestinationUrl] = useState("")
  const [newQrTitle, setNewQrTitle] = useState("")
  const [newQrImagePreview, setNewQrImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateQrCodeImages = useCallback((images: QrCodeImage[]) => {
    if (onQrCodeImagesChange) {
      onQrCodeImagesChange(images)
    } else {
      setInternalQrCodeImages(images)
    }
  }, [onQrCodeImagesChange])

  const hasQrCodes = qrCodeImages.length > 0

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

  const confirmQROpen = () => {
    if (qrUrlToOpen) {
      window.open(qrUrlToOpen, "_blank")
    }
    setShowQRConfirmation(false)
    setQrUrlToOpen(null)
  }

  const cancelQROpen = () => {
    setShowQRConfirmation(false)
    setQrUrlToOpen(null)
  }

  // QR Code handlers
  const handleQRCode = async () => {
    if (!isEditMode && hasQrCodes) {
      // VIEW MODE: Auto-scan QR image → extract URL → show confirmation
      if (qrCodeImages.length === 1) {
        const qr = qrCodeImages[0]
        // If URL already saved, show confirmation
        if (qr.destinationUrl) {
          setQrUrlToOpen(qr.destinationUrl)
          setShowQRConfirmation(true)
          return
        }
        // No URL saved but has image — auto-scan the QR image
        if (qr.imageUrl) {
          setIsScanning(true)
          setScanResult(null)
          try {
            const scannedUrl = await scanQrFromImage(qr.imageUrl)
            if (scannedUrl) {
              // Save the scanned URL back to the QR data
              const updatedImages = qrCodeImages.map((q) =>
                q.id === qr.id ? { ...q, destinationUrl: scannedUrl } : q
              )
              updateQrCodeImages(updatedImages)
              // Show confirmation
              setQrUrlToOpen(scannedUrl)
              setShowQRConfirmation(true)
            } else {
              setScanResult({ success: false, message: "Tiada URL dikesan dalam gambar QR." })
            }
          } catch {
            setScanResult({ success: false, message: "Gagal mengimbas QR Code." })
          }
          setIsScanning(false)
          return
        }
        return
      }

      // Multiple QR codes — try to find ones with URLs
      const qrsWithUrl = qrCodeImages.filter((qr) => qr.destinationUrl)
      if (qrsWithUrl.length === 1) {
        setQrUrlToOpen(qrsWithUrl[0].destinationUrl)
        setShowQRConfirmation(true)
        return
      }
      if (qrsWithUrl.length > 1) {
        setShowQRDialog(true)
        return
      }

      // No URLs saved — scan all QR images and open first found
      const qrsWithImage = qrCodeImages.filter((qr) => qr.imageUrl)
      if (qrsWithImage.length > 0) {
        setIsScanning(true)
        setScanResult(null)
        for (const qr of qrsWithImage) {
          try {
            const scannedUrl = await scanQrFromImage(qr.imageUrl)
            if (scannedUrl) {
              const updatedImages = qrCodeImages.map((q) =>
                q.id === qr.id ? { ...q, destinationUrl: scannedUrl } : q
              )
              updateQrCodeImages(updatedImages)
              setQrUrlToOpen(scannedUrl)
              setShowQRConfirmation(true)
              setIsScanning(false)
              return
            }
          } catch {
            // Continue to next QR
          }
        }
        setScanResult({ success: false, message: "Tiada URL dikesan dalam mana-mana gambar QR." })
        setIsScanning(false)
      }
      return
    }
    // EDIT MODE: Show management dialog
    setShowQRDialog(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      setNewQrImagePreview(event.target?.result as string)
      setIsUploading(false)
    }
    reader.onerror = () => {
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleAddQrCode = () => {
    if (!newQrImagePreview && !newQrDestinationUrl) return

    const newQr: QrCodeImage = {
      id: Date.now(),
      imageUrl: newQrImagePreview || "",
      destinationUrl: newQrDestinationUrl,
      title: newQrTitle || `QR Code ${qrCodeImages.length + 1}`,
    }

    updateQrCodeImages([...qrCodeImages, newQr])

    // Reset form
    setNewQrImagePreview(null)
    setNewQrDestinationUrl("")
    setNewQrTitle("")
    setScanResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDeleteQrCode = (id: number) => {
    updateQrCodeImages(qrCodeImages.filter((qr) => qr.id !== id))
  }

  const handleOpenDestination = (url: string) => {
    if (url) {
      window.open(url, "_blank")
    }
  }

  const closeQRDialog = () => {
    setShowQRDialog(false)
    setNewQrImagePreview(null)
    setNewQrDestinationUrl("")
    setNewQrTitle("")
    setScanResult(null)
    setIsScanning(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
              ? t('noDescriptionEdit').replace('"Add"', `"${t('add')}"`) 
              : t('noDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Description Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t('description')}</h3>
              {isEditMode && (
                <Button
                  onClick={addDescription}
                  size="sm"
                  variant="outline"
                  className="h-8 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/30 transition-all"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('add')}
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
                    ? t('noDescriptionEdit').replace('"Add"', `"${t('add')}"`)
                    : t('noDescription')}
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
            <h3 className="text-sm font-semibold mb-3">{t('navigationActions')}</h3>
            <div className={`grid gap-3 ${lat && lng ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {lat && lng && (
                <>
                  <Button
                    onClick={handleGoogleMaps}
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 transition-all duration-200 group"
                  >
                    <img
                      src="/Gmaps.png"
                      alt="Google Maps"
                      className="h-7 w-7 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-medium">{t('googleMaps')}</span>
                  </Button>
                  
                  <Button
                    onClick={handleWaze}
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 hover:bg-cyan-50 hover:border-cyan-300 dark:hover:bg-cyan-950/30 transition-all duration-200 group"
                  >
                    <img
                      src="/waze.png"
                      alt="Waze"
                      className="h-5 w-5 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-medium">{t('waze')}</span>
                  </Button>
                </>
              )}
              
              {/* QR Code Button - Smart Display: always show in edit mode, only show in view mode if QR codes exist */}
              {(isEditMode || hasQrCodes) && (
                <Button
                  onClick={handleQRCode}
                  variant="outline"
                  disabled={isScanning}
                  className="flex flex-col h-auto py-4 gap-2 hover:bg-cyan-50 hover:border-cyan-300 dark:hover:bg-cyan-950/30 transition-all duration-200 group"
                >
                  {isScanning ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <QrCode className="h-8 w-8 text-cyan-600 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs font-medium">
                    {isScanning
                      ? t('scanning')
                      : isEditMode 
                        ? (hasQrCodes ? `${t('qrCode')} (${qrCodeImages.length})` : t('qrCode')) 
                        : t('qrCode')}
                  </span>
                </Button>
              )}
              {/* Scan error message */}
              {scanResult && !scanResult.success && !isEditMode && (
                <div className="col-span-full flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {scanResult.message}
                </div>
              )}
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
                  <span>{t('openGoogleMaps')}</span>
                </>
              ) : (
                <>
                  <Navigation className="h-6 w-6 text-cyan-600" />
                  <span>{t('openWaze')}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t('navigateToLocation')} {navigationType === "google" ? t('googleMaps') : t('waze')} {t('forNavigation')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{t('coordinates')}:</span>
                <span className="font-mono font-semibold text-sm bg-background px-3 py-1 rounded-md">{lat}, {lng}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{t('platform')}:</span>
                <div className="flex items-center gap-2">
                  {navigationType === "google" ? (
                    <>
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-600">{t('googleMaps')}</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 text-cyan-600" />
                      <span className="font-semibold text-cyan-600">{t('waze')}</span>
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
              {t('cancel')}
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
                  {t('openGoogleMaps').replace('?', '')}
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('openWaze').replace('?', '')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Confirmation Dialog */}
      <Dialog open={showQRConfirmation} onOpenChange={setShowQRConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <QrCode className="h-6 w-6 text-purple-600" />
              <span>{t('openQRCode')}</span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t('navigateToLocation')} URL {t('forNavigation')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg p-4 space-y-3 border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground font-medium block mb-1">{t('destinationUrl')}:</span>
                  <span className="text-sm font-mono font-semibold break-all">{qrUrlToOpen}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
              <ExternalLink className="h-3 w-3" />
              <span>{t('newTabWillOpen')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={cancelQROpen}
              className="hover:bg-muted transition-all"
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={confirmQROpen}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {t('openQRCode').replace('?', '')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Management Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <QrCode className="h-6 w-6 text-purple-600" />
              <span>{isEditMode ? "Urus QR Code" : "Pilih QR Code"}</span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              {isEditMode 
                ? "Upload gambar QR Code — URL akan diimbas secara automatik."
                : "Pilih QR Code untuk terus ke destinasi."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Edit Mode: Add New QR Code Form */}
            {isEditMode && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Plus className="h-4 w-4" />
                  Tambah QR Code Baru
                </h4>
                
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Gambar QR Code</label>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 h-10 border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memuat naik...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Pilih Gambar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Image Preview */}
                  {newQrImagePreview && (
                    <div className="relative group">
                      <img 
                        src={newQrImagePreview} 
                        alt="QR Preview" 
                        className="w-full max-h-40 object-contain rounded-lg border bg-white dark:bg-gray-900 p-2"
                      />
                      <button
                        onClick={() => {
                          setNewQrImagePreview(null)
                          setNewQrDestinationUrl("")
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Tajuk (Pilihan)</label>
                  <Input
                    placeholder="cth: QR Code Menu"
                    value={newQrTitle}
                    onChange={(e) => setNewQrTitle(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Destination URL */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">URL Destinasi</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com"
                      value={newQrDestinationUrl}
                      onChange={(e) => setNewQrDestinationUrl(e.target.value)}
                      className="h-9 text-sm pl-9"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleAddQrCode}
                  disabled={!newQrImagePreview && !newQrDestinationUrl}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white transition-all shadow-md hover:shadow-lg"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Simpan QR Code
                </Button>
              </div>
            )}

            {/* QR Code List */}
            {qrCodeImages.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-purple-600" />
                  Senarai QR Code ({qrCodeImages.length})
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {qrCodeImages.map((qr, index) => (
                    <div 
                      key={qr.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-200 group ${
                        !isEditMode && qr.destinationUrl ? "cursor-pointer" : ""
                      }`}
                      onClick={() => {
                        // VIEW MODE: Click entire row to open URL directly
                        if (!isEditMode && qr.destinationUrl) {
                          window.open(qr.destinationUrl, "_blank")
                          setShowQRDialog(false)
                        }
                      }}
                    >
                      {/* Number Badge */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {index + 1}
                      </div>

                      {/* QR Image Thumbnail */}
                      {qr.imageUrl && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg border bg-white dark:bg-gray-900 overflow-hidden">
                          <img 
                            src={qr.imageUrl} 
                            alt={qr.title} 
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{qr.title || `QR Code ${index + 1}`}</p>
                        {qr.destinationUrl && (
                          <p className="text-xs text-muted-foreground truncate">{qr.destinationUrl}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-1">
                        {/* View Mode: Arrow indicator to show it's clickable */}
                        {!isEditMode && qr.destinationUrl && (
                          <div className="h-8 w-8 flex items-center justify-center text-purple-500 group-hover:text-purple-700 transition-colors">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        )}
                        {/* Edit Mode: Open URL + Delete button */}
                        {isEditMode && qr.destinationUrl && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-950/50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDestination(qr.destinationUrl)
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {isEditMode && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteQrCode(qr.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950/30 mb-3">
                  <QrCode className="h-7 w-7 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isEditMode 
                    ? 'Tiada QR Code. Gunakan borang di atas untuk menambah.'
                    : 'Tiada QR Code tersedia.'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              variant="outline" 
              onClick={closeQRDialog}
              className="hover:bg-muted transition-all"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
