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
    code: "KL-001",
    location: "KLCC",
    delivery: "Daily",
    shift: "AM",
    lastUpdateTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    locations: [
      { id: "1-1", no: 1, code: "101", location: "Suria KLCC L1", delivery: "Daily", deliveryMode: "daily", lat: "3.1578", lng: "101.7123" },
      { id: "1-2", no: 2, code: "102", location: "Suria KLCC L2", delivery: "Daily", deliveryMode: "daily", lat: "3.1579", lng: "101.7124" },
      { id: "1-3", no: 3, code: "103", location: "Avenue K", delivery: "Weekday", deliveryMode: "weekday", lat: "3.1565", lng: "101.7171" },
    ],
  },
  {
    id: "2",
    code: "KL-002",
    location: "Pavilion KL",
    delivery: "Daily",
    shift: "PM",
    lastUpdateTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    locations: [
      { id: "2-1", no: 1, code: "111", location: "Pavilion Main Wing", delivery: "Daily", deliveryMode: "daily", lat: "3.1496", lng: "101.7144" },
      { id: "2-2", no: 2, code: "112", location: "Pavilion Elite", delivery: "Daily", deliveryMode: "daily", lat: "3.1497", lng: "101.7145" },
      { id: "2-3", no: 3, code: "113", location: "Fahrenheit88", delivery: "Alt 1", deliveryMode: "alt1", lat: "3.1485", lng: "101.7132" },
      { id: "2-4", no: 4, code: "114", location: "Lot 10", delivery: "Weekday", deliveryMode: "weekday", lat: "3.1476", lng: "101.7107" },
    ],
  },
  {
    id: "3",
    code: "KL-003",
    location: "Mid Valley Megamall",
    delivery: "Weekday",
    shift: "AM",
    lastUpdateTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    locations: [
      { id: "3-1", no: 1, code: "121", location: "Mid Valley Centre Court", delivery: "Daily", deliveryMode: "daily", lat: "3.1185", lng: "101.6775" },
      { id: "3-2", no: 2, code: "122", location: "The Gardens Mall", delivery: "Weekday", deliveryMode: "weekday", lat: "3.1188", lng: "101.6764" },
    ],
  },
  {
    id: "4",
    code: "KL-004",
    location: "Berjaya Times Square",
    delivery: "Alt 1",
    shift: "PM",
    lastUpdateTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    locations: [
      { id: "4-1", no: 1, code: "131", location: "Times Square L3", delivery: "Daily", deliveryMode: "daily", lat: "3.1425", lng: "101.7107" },
      { id: "4-2", no: 2, code: "132", location: "Times Square L7", delivery: "Alt 1", deliveryMode: "alt1", lat: "3.1426", lng: "101.7108" },
      { id: "4-3", no: 3, code: "133", location: "Sungei Wang", delivery: "Weekday", deliveryMode: "weekday", lat: "3.1479", lng: "101.7107" },
    ],
  },
  {
    id: "5",
    code: "KL-005",
    location: "Suria KLCC",
    delivery: "Daily",
    shift: "AM",
    lastUpdateTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    locations: [
      { id: "5-1", no: 1, code: "141", location: "KLCC Park Booth", delivery: "Daily", deliveryMode: "daily", lat: "3.1531", lng: "101.7138" },
      { id: "5-2", no: 2, code: "142", location: "Aquaria KLCC", delivery: "Daily", deliveryMode: "daily", lat: "3.1542", lng: "101.7106" },
    ],
  },
]
