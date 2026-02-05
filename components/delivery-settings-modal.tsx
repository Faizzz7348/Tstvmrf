"use client"

import { useState } from "react"
import { Truck, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type DeliveryMode = "daily" | "alt1" | "alt2" | "weekday" | "weekend"

interface DeliveryOption {
  id: DeliveryMode
  label: string
  description: string
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: "daily",
    label: "Daily",
    description: "Everyday delivery",
  },
  {
    id: "alt1",
    label: "Alt 1 Delivery",
    description: "Delivery on odd dates only (1, 3, 5, 7...)",
  },
  {
    id: "alt2",
    label: "Alt 2 Delivery",
    description: "Delivery on even dates only (2, 4, 6, 8...)",
  },
  {
    id: "weekday",
    label: "Weekday Delivery",
    description: "Sunday to Thursday only",
  },
  {
    id: "weekend",
    label: "Weekend Delivery",
    description: "Monday to Friday only",
  },
]

interface DeliverySettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMode: DeliveryMode
  onModeChange: (mode: DeliveryMode) => void
  locationName?: string
}

// Helper function to check if delivery is available today
export function hasDeliveryToday(mode: DeliveryMode): boolean {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
  const dateOfMonth = today.getDate()

  switch (mode) {
    case "daily":
      return true
    case "alt1":
      return dateOfMonth % 2 !== 0 // odd dates
    case "alt2":
      return dateOfMonth % 2 === 0 // even dates
    case "weekday":
      return dayOfWeek >= 0 && dayOfWeek <= 4 // Sunday to Thursday
    case "weekend":
      return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday
    default:
      return false
  }
}

export function DeliverySettingsModal({
  open,
  onOpenChange,
  currentMode,
  onModeChange,
  locationName = "Location",
}: DeliverySettingsModalProps) {
  const [selectedMode, setSelectedMode] = useState<DeliveryMode>(currentMode)

  const handleModeChange = (mode: DeliveryMode) => {
    setSelectedMode(mode)
    onModeChange(mode)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delivery Settings</DialogTitle>
          <DialogDescription>
            Configure delivery schedule for {locationName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {deliveryOptions.map((option) => {
            const isActive = selectedMode === option.id
            const hasDelivery = hasDeliveryToday(option.id)
            
            return (
              <div
                key={option.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-all cursor-pointer hover:bg-accent/50",
                  isActive && "border-primary bg-accent",
                  !hasDelivery && "opacity-50"
                )}
                onClick={() => handleModeChange(option.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  {hasDelivery ? (
                    <div className="rounded-full bg-green-500/10 p-2">
                      <Truck className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-red-500/10 p-2">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{option.label}</p>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => handleModeChange(option.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                  {isActive && (
                    <p className="text-xs font-medium mt-2">
                      {hasDelivery ? (
                        <span className="text-green-600 dark:text-green-500">
                          ✓ Delivery available today
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-500">
                          ✗ No delivery today
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
