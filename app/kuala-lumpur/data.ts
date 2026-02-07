export type DeliveryMode = "daily" | "alt1" | "alt2" | "weekday" | "weekend"

export interface QrCodeImage {
  id: number
  imageUrl: string
  destinationUrl: string
  title: string
}

export interface Location {
  id: string
  no: number
  code: string
  location: string
  delivery: string
  deliveryMode?: DeliveryMode
  lat?: string
  lng?: string
  qrCodeImages?: QrCodeImage[]
}

export interface Route {
  id: string
  code: string
  location: string
  delivery: string
  shift: "AM" | "PM"
  lastUpdateTime: Date
  locations: Location[]
  deliveryMode?: DeliveryMode
}

export const initialRoutes: Route[] = []

