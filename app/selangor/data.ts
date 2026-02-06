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

export const initialRoutes: Route[] = [
  {
    id: "1",
    code: "SEL-001",
    location: "Shah Alam Mall",
    delivery: "Daily",
    shift: "AM",
    lastUpdateTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    locations: [
      { id: "1-1", no: 1, code: "54", location: "KPJ Klang", delivery: "Daily", deliveryMode: "daily", lat: "3.0443", lng: "101.4457" },
      { id: "1-2", no: 2, code: "55", location: "KPJ Shah Alam", delivery: "Weekday", deliveryMode: "weekday", lat: "3.0738", lng: "101.5183" },
      { id: "1-3", no: 3, code: "56", location: "Tesco Extra", delivery: "Daily", deliveryMode: "daily", lat: "3.0689", lng: "101.5206" },
    ],
  },
  {
    id: "2",
    code: "SEL-002",
    location: "Subang Jaya Plaza",
    delivery: "Weekday",
    shift: "PM",
    lastUpdateTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    locations: [
      { id: "2-1", no: 1, code: "61", location: "Hospital Subang", delivery: "Daily", deliveryMode: "daily", lat: "3.0481", lng: "101.5867" },
      { id: "2-2", no: 2, code: "62", location: "SS15 Court", delivery: "Alt 1", deliveryMode: "alt1", lat: "3.0774", lng: "101.5916" },
      { id: "2-3", no: 3, code: "63", location: "Summit USJ", delivery: "Weekday", deliveryMode: "weekday", lat: "3.0438", lng: "101.5806" },
      { id: "2-4", no: 4, code: "64", location: "Sunway Pyramid", delivery: "Daily", deliveryMode: "daily", lat: "3.0733", lng: "101.6069" },
    ],
  },
  {
    id: "3",
    code: "SEL-003",
    location: "Petaling Jaya Station",
    delivery: "Alt 1",
    shift: "AM",
    lastUpdateTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    locations: [
      { id: "3-1", no: 1, code: "72", location: "LRT Kelana Jaya", delivery: "Daily", deliveryMode: "daily", lat: "3.1135", lng: "101.5886" },
      { id: "3-2", no: 2, code: "73", location: "Paradigm Mall", delivery: "Weekday", deliveryMode: "weekday", lat: "3.1121", lng: "101.5886" },
    ],
  },
  {
    id: "4",
    code: "SEL-004",
    location: "Klang Sentral",
    delivery: "Daily",
    shift: "PM",
    lastUpdateTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    locations: [
      { id: "4-1", no: 1, code: "81", location: "Klang Parade", delivery: "Daily", deliveryMode: "daily", lat: "3.0356", lng: "101.4468" },
      { id: "4-2", no: 2, code: "82", location: "AEON Bukit Tinggi", delivery: "Daily", deliveryMode: "daily", lat: "3.0490", lng: "101.4029" },
      { id: "4-3", no: 3, code: "83", location: "Hospital Tengku Ampuan", delivery: "Alt 1", deliveryMode: "alt1", lat: "3.0422", lng: "101.4459" },
    ],
  },
]
