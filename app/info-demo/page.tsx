"use client"

import { useState } from "react"
import { InfoModal } from "@/components/info-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export default function InfoDemoPage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const handleRestaurantQR = () => {
    alert("QR Code untuk menu restoran akan dijana!")
  }

  const handleOfficeQR = () => {
    alert("QR Code untuk lokasi pejabat akan dijana!")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">Info Modal Demo</h1>
          <p className="text-muted-foreground">
            Contoh penggunaan Info Button dengan pelbagai konfigurasi
          </p>
          
          {/* Edit Mode Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className="text-sm font-medium">View Mode</span>
            <Switch
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
            />
            <span className="text-sm font-medium">Edit Mode</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Example 1: Restaurant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Restoran Nasi Lemak
                <InfoModal
                  title="Maklumat Restoran"
                  defaultDescriptions={[
                    "Buka setiap hari: 7:00 AM - 10:00 PM",
                    "Hidangan: Nasi Lemak, Nasi Goreng, Mee Goreng",
                    "Harga: RM5 - RM15",
                    "Delivery tersedia melalui delivery partner"
                  ]}
                  lat="3.139"
                  lng="101.687"
                  onGenerateQR={handleRestaurantQR}
                  isEditMode={isEditMode}
                />
              </CardTitle>
              <CardDescription>
                Klik button info untuk lihat maklumat lengkap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Restoran terkenal dengan nasi lemak yang sedap di kawasan Kuala Lumpur.
              </p>
            </CardContent>
          </Card>

          {/* Example 2: Office Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pejabat Utama
                <InfoModal
                  title="Lokasi Pejabat"
                  defaultDescriptions={[
                    "Alamat: Menara KLCC, Kuala Lumpur",
                    "Waktu Operasi: 9:00 AM - 6:00 PM",
                    "Parking tersedia di basement",
                    "LRT: Stesen KLCC"
                  ]}
                  lat="3.1578"
                  lng="101.7123"
                  onGenerateQR={handleOfficeQR}
                  isEditMode={isEditMode}
                />
              </CardTitle>
              <CardDescription>
                Maklumat pejabat dan cara ke sini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pejabat utama terletak di pusat bandar dengan akses mudah melalui LRT.
              </p>
            </CardContent>
          </Card>

          {/* Example 3: Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Majlis Perkahwinan
                <InfoModal
                  title="Maklumat Majlis"
                  defaultDescriptions={[
                    "Tarikh: 15 Mac 2026",
                    "Masa: 12:00 PM - 5:00 PM",
                    "Lokasi: Dewan Serbaguna Shah Alam",
                    "Dress code: Formal/Tradisional",
                    "RSVP sebelum 1 Mac 2026"
                  ]}
                  lat="3.0738"
                  lng="101.5183"
                  onGenerateQR={() => alert("QR Code untuk kad jemputan akan dijana!")}
                  isEditMode={isEditMode}
                />
              </CardTitle>
              <CardDescription>
                Jemput hadir ke majlis kami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dengan segala hormatnya kami menjemput YBhg. Dato&apos;/Datin/Tuan/Puan ke majlis perkahwinan kami.
              </p>
            </CardContent>
          </Card>

          {/* Example 4: Empty State */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Custom Info
                <InfoModal
                  title="Tambah Maklumat Sendiri"
                  defaultDescriptions={[]}
                  isEditMode={isEditMode}
                />
              </CardTitle>
              <CardDescription>
                Mulakan dengan tiada data, tambah sendiri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contoh modal kosong di mana user boleh tambah penerangan sendiri (Toggle Edit Mode).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Cara Guna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              <p className="text-sm">Toggle <strong>Edit Mode</strong> di atas untuk enable/disable editing</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
              <p className="text-sm">Klik button <strong>Info</strong> pada setiap card</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
              <p className="text-sm">Dalam Edit Mode: Klik <strong>&quot;Tambah&quot;</strong> untuk menambah penerangan baru</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
              <p className="text-sm">Edit atau delete penerangan (hanya dalam Edit Mode)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</span>
              <p className="text-sm">Klik button <strong>Google Maps</strong>, <strong>Waze</strong>, atau <strong>QR Code</strong> di bahagian bawah modal</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
