"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Eye, Edit, Trash2, FileText, ArrowLeft, Info, Power, Menu, Maximize2, Save, Loader2 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Route, initialRoutes, Location, DeliveryMode } from "./data"
import { DeliverySettingsModal, hasDeliveryToday } from "@/components/delivery-settings-modal"
import { InfoModal } from "@/components/info-modal"
import { ColumnCustomizeModal, ColumnConfig } from "@/components/column-customize-modal"
import { RowCustomizeModal, RowCustomSort } from "@/components/row-customize-modal"
import { cn, getRelativeTime } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { useRoutes } from "@/hooks/use-routes"
import { LoadingSpinner, LoadingPage } from "@/components/ui/loading-spinner"

export default function SelangorPage() {
  const { addToast } = useToast()
  const { 
    routes, 
    setRoutes, 
    isLoading,
    error: dbError
  } = useRoutes('selangor', initialRoutes)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewRoute, setViewRoute] = useState<Route | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSwitchingMode, setIsSwitchingMode] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [moveDestination, setMoveDestination] = useState<{region: string, routeId: string}>({region: "selangor", routeId: ""})
  const [showDeleteRowsDialog, setShowDeleteRowsDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState<Set<string>>(new Set())
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [locationFormData, setLocationFormData] = useState({
    code: "",
    location: "",
    delivery: "Daily",
    lat: "",
    lng: ""
  })
  const [formData, setFormData] = useState({
    code: "",
    location: "",
    delivery: "Daily",
    shift: "AM" as "AM" | "PM",
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showColumnCustomize, setShowColumnCustomize] = useState(false)
  const [showRowCustomize, setShowRowCustomize] = useState(false)
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { id: "no", label: "No", visible: true, order: 0, locked: true },
    { id: "code", label: "Code", visible: true, order: 1 },
    { id: "location", label: "Location", visible: true, order: 2 },
    { id: "lat", label: "Latitude", visible: true, order: 3 },
    { id: "lng", label: "Longitude", visible: true, order: 4 },
    { id: "delivery", label: "Delivery", visible: true, order: 5 },
    { id: "action", label: "Action", visible: true, order: 6, locked: true },
  ])
  const [customRowSort, setCustomRowSort] = useState<RowCustomSort[] | null>(null)

  // Update time every minute for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Show database error if any
  useEffect(() => {
    if (dbError) {
      addToast(dbError, "error")
    }
  }, [dbError, addToast])

  // Exit edit mode handler
  const handleExitEditMode = async () => {
    setIsSwitchingMode(true)
    // Simulate transition
    await new Promise(resolve => setTimeout(resolve, 300))
    setIsEditMode(false)
    setIsSwitchingMode(false)
  }

  // Check for duplicates
  const checkDuplicate = (code: string, currentId: string): boolean => {
    if (!code.trim()) return false
    // Check within current route
    const duplicateInRoute = viewRoute?.locations.some(
      loc => loc.id !== currentId && loc.code === code
    )
    if (duplicateInRoute) return true

    // Check across all routes
    const duplicateAcrossRoutes = routes.some(route => 
      route.locations.some(loc => loc.code === code && loc.id !== currentId)
    )
    return duplicateAcrossRoutes
  }

  // Update location field with auto-save to API
  const updateLocationField = async (id: string, field: keyof Location, value: string) => {
    if (!viewRoute) return

    const updatedRoute = {
      ...viewRoute,
      locations: viewRoute.locations.map(loc =>
        loc.id === id ? { ...loc, [field]: value } : loc
      ),
      lastUpdateTime: new Date()
    }

    setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
    setViewRoute(updatedRoute)

    // Save to API
    try {
      const fieldMap: Record<string, string> = {
        'code': 'code',
        'location': 'name',
        'lat': 'address',
        'lng': 'contact'
      }
      
      const apiField = fieldMap[field] || field
      
      await fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          [apiField]: value
        })
      })
    } catch (error) {
      console.error('Error updating location field:', error)
    }
  }

  // Update QR code images for a location with auto-save
  const updateLocationQrCodes = async (locationId: string, qrCodeImages: { id: number; imageUrl: string; destinationUrl: string; title: string }[]) => {
    if (!viewRoute) return

    const updatedRoute = {
      ...viewRoute,
      locations: viewRoute.locations.map(loc =>
        loc.id === locationId ? { ...loc, qrCodeImages } : loc
      ),
      lastUpdateTime: new Date()
    }

    setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
    setViewRoute(updatedRoute)
    
    // Save to API - QR codes can be stored in notes as JSON for now
    try {
      await fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: locationId,
          notes: JSON.stringify({ qrCodes: qrCodeImages })
        })
      })
      addToast("QR Code dikemaskini!", "success")
    } catch (error) {
      console.error('Error updating QR codes:', error)
    }
  }

  // Sort locations by code (default) or custom sort order
  const sortedLocations = useMemo(() => {
    if (!viewRoute?.locations) return []
    
    let sorted = [...viewRoute.locations]
    
    // Separate rows with and without delivery
    const withDelivery = sorted.filter(loc => hasDeliveryToday(loc.deliveryMode || "daily"))
    const withoutDelivery = sorted.filter(loc => !hasDeliveryToday(loc.deliveryMode || "daily"))
    
    // Apply custom sort if active
    if (customRowSort && customRowSort.length > 0) {
      const sortMap = new Map(customRowSort.map((s, idx) => [s.id, s.customOrder ?? idx]))
      const sortFn = (a: Location, b: Location) => {
        const orderA = sortMap.get(a.id) ?? 9999
        const orderB = sortMap.get(b.id) ?? 9999
        return orderA - orderB
      }
      withDelivery.sort(sortFn)
      withoutDelivery.sort(sortFn)
    } else {
      // Default sort by code
      const sortFn = (a: Location, b: Location) => {
        const codeA = a.code || ""
        const codeB = b.code || ""
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' })
      }
      withDelivery.sort(sortFn)
      withoutDelivery.sort(sortFn)
    }
    
    // Combine: with delivery first, without delivery last
    sorted = [...withDelivery, ...withoutDelivery]
    
    return sorted.map((loc, index) => ({
      ...loc,
      displayNo: index + 1
    }))
  }, [viewRoute?.locations, customRowSort])

  // Get visible columns in order
  const visibleColumns = useMemo(() => {
    return columnConfig
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order)
  }, [columnConfig])

  // Helper to check if column should show (based on edit mode for lat/lng)
  const shouldShowColumn = (columnId: string) => {
    const col = visibleColumns.find(c => c.id === columnId)
    if (!col) return false
    if (columnId === 'lat' || columnId === 'lng') {
      return isEditMode && col.visible
    }
    return col.visible
  }

  // Render a table cell based on column ID
  const renderTableCell = (columnId: string, item: Location & { displayNo: number }, itemHasDelivery: boolean, isDuplicate: boolean) => {
    switch (columnId) {
      case 'no':
        return <TableCell key="no" className="font-medium">{item.displayNo}</TableCell>
      
      case 'code':
        return (
          <TableCell key="code">
            {isEditMode ? (
              <>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={item.code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    if (val.length <= 4) {
                      updateLocationField(item.id, 'code', val)
                    }
                  }}
                  className={cn(
                    "h-8 text-center",
                    isDuplicate && "border-red-500 bg-red-50 dark:bg-red-950/30"
                  )}
                />
                {isDuplicate && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Duplicate</p>
                )}
              </>
            ) : (
              <div className={cn(
                "text-center",
                isDuplicate && "text-red-600 dark:text-red-400"
              )}>
                {item.code}
                {isDuplicate && (
                  <span className="text-xs ml-2">(Duplicate)</span>
                )}
              </div>
            )}
          </TableCell>
        )
      
      case 'location':
        return (
          <TableCell key="location">
            {isEditMode ? (
              <Input
                type="text"
                value={item.location}
                onChange={(e) => updateLocationField(item.id, 'location', e.target.value)}
                className="h-8"
              />
            ) : (
              <span>{item.location}</span>
            )}
          </TableCell>
        )
      
      case 'lat':
        if (!isEditMode) return null
        return (
          <TableCell key="lat">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.0000"
              value={item.lat || ''}
              onChange={(e) => updateLocationField(item.id, 'lat', e.target.value)}
              className="h-8 text-center"
            />
          </TableCell>
        )
      
      case 'lng':
        if (!isEditMode) return null
        return (
          <TableCell key="lng">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.0000"
              value={item.lng || ''}
              onChange={(e) => updateLocationField(item.id, 'lng', e.target.value)}
              className="h-8 text-center"
            />
          </TableCell>
        )
      
      case 'delivery':
        return (
          <TableCell key="delivery" className="text-center">
            {isEditMode ? (
              <select
                value={item.delivery}
                onChange={(e) => {
                  const deliveryValue = e.target.value
                  let mode: DeliveryMode = "daily"
                  
                  switch(deliveryValue) {
                    case "Daily": mode = "daily"; break
                    case "Alt 1": mode = "alt1"; break
                    case "Alt 2": mode = "alt2"; break
                    case "Weekday": mode = "weekday"; break
                    case "Weekend": mode = "weekend"; break
                  }
                  
                  if (!viewRoute) return
                  
                  const updatedRoute = {
                    ...viewRoute,
                    locations: viewRoute.locations.map(loc =>
                      loc.id === item.id 
                        ? { ...loc, delivery: deliveryValue, deliveryMode: mode } 
                        : loc
                    ),
                    lastUpdateTime: new Date()
                  }
                  
                  setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
                  setViewRoute(updatedRoute)
                }}
                className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="Not Set">Not Set</option>
                <option value="Daily">Daily</option>
                <option value="Alt 1">Alt 1</option>
                <option value="Alt 2">Alt 2</option>
                <option value="Weekday">Weekday</option>
                <option value="Weekend">Weekend</option>
              </select>
            ) : (
              <span>{item.delivery}</span>
            )}
          </TableCell>
        )
      
      case 'action':
        return (
          <TableCell key="action" className="text-center">
            <div className="flex justify-center gap-1">
              <InfoModal
                title={`Maklumat ${item.code} - ${item.location}`}
                defaultDescriptions={[
                  `Code: ${item.code}`,
                  `Location: ${item.location}`,
                  `Latitude: ${item.lat || 'Not set'}`,
                  `Longitude: ${item.lng || 'Not set'}`,
                  `Delivery Type: ${item.delivery}`,
                  `Route: ${viewRoute?.code || 'N/A'} (${viewRoute?.shift || 'N/A'})`,
                  `Delivery Today: ${itemHasDelivery ? 'Yes' : 'No'}`
                ]}
                lat={item.lat}
                lng={item.lng}
                qrCodeImages={item.qrCodeImages || []}
                onQrCodeImagesChange={(images) => updateLocationQrCodes(item.id, images)}
                triggerVariant="ghost"
                isEditMode={isEditMode}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8",
                  item.delivery === "Not Set" 
                    ? "text-gray-400 cursor-not-allowed dark:text-gray-600" 
                    : itemHasDelivery 
                      ? "text-green-600 hover:text-green-700 dark:text-green-500" 
                      : "text-red-600 hover:text-red-700 dark:text-red-500"
                )}
                onClick={() => {
                  if (item.delivery === "Not Set") {
                    addToast("Please set a delivery type first", "warning")
                    return
                  }
                  if (isEditMode) {
                    openDeliveryModal(item)
                  } else {
                    addToast("Please enable Edit Mode to change delivery settings", "warning")
                  }
                }}
              >
                <Power className="h-4 w-4" />
              </Button>
              {isEditMode && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/30"
                  onClick={() => openDeleteRowsDialog(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        )
      
      default:
        return null
    }
  }

  const filteredRoutes = routes.filter(
    (route) =>
      route.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateRoute = async () => {
    if (!formData.code || !formData.location) {
      addToast("Please fill in all required fields", "error")
      return
    }

    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          name: formData.location,
          description: `${formData.shift} shift`,
          region: 'selangor',
          active: true
        })
      })

      if (!response.ok) throw new Error('Failed to create route')
      const newRouteData = await response.json()

      const newRoute: Route = {
        id: newRouteData.id,
        code: formData.code,
        location: formData.location,
        delivery: formData.delivery,
        shift: formData.shift,
        lastUpdateTime: new Date(),
        locations: [],
      }
      
      setRoutes([...routes, newRoute])
      setShowCreateModal(false)
      setFormData({ code: "", location: "", delivery: "Daily", shift: "AM" })
      addToast(`Route ${formData.code} created successfully!`, "success")
    } catch (error) {
      console.error('Error creating route:', error)
      addToast('Failed to create route. Please try again.', 'error')
    }
  }

  const handleEditRoute = async () => {
    if (!selectedRoute) return

    try {
      const response = await fetch('/api/routes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRoute.id,
          code: formData.code,
          name: formData.location,
          description: `${formData.shift} shift`
        })
      })

      if (!response.ok) throw new Error('Failed to update route')

      setRoutes(
        routes.map((m) =>
          m.id === selectedRoute.id
            ? { ...m, code: formData.code, location: formData.location, delivery: formData.delivery, shift: formData.shift, lastUpdateTime: new Date() }
            : m
        )
      )
      setShowEditModal(false)
      setFormData({ code: "", location: "", delivery: "Daily", shift: "AM" })
      setSelectedRoute(null)
      addToast('Route updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating route:', error)
      addToast('Failed to update route. Please try again.', 'error')
    }
  }

  const handleDeleteRoute = async () => {
    if (!selectedRoute) return

    try {
      const response = await fetch(`/api/routes?id=${selectedRoute.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete route')

      setRoutes(routes.filter((m) => m.id !== selectedRoute.id))
      setShowDeleteDialog(false)
      setSelectedRoute(null)
      addToast('Route deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting route:', error)
      addToast('Failed to delete route. Please try again.', 'error')
    }
  }

  const handleAddLocation = async () => {
    if (!viewRoute || !locationFormData.code || !locationFormData.location) {
      addToast("Please fill in required fields (Code and Location)", "error")
      return
    }

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: viewRoute.id,
          code: locationFormData.code,
          name: locationFormData.location,
          address: locationFormData.lat || '',
          contact: locationFormData.lng || '',
          notes: '',
          position: viewRoute.locations.length,
          active: true
        })
      })

      if (!response.ok) throw new Error('Failed to create location')
      const newLocationData = await response.json()

      const newLocation: Location = {
        id: newLocationData.id,
        no: viewRoute.locations.length + 1,
        code: locationFormData.code,
        location: locationFormData.location,
        delivery: locationFormData.delivery,
        deliveryMode: locationFormData.delivery === "Daily" ? "daily" : 
                      locationFormData.delivery === "Alt 1" ? "alt1" :
                      locationFormData.delivery === "Alt 2" ? "alt2" :
                      locationFormData.delivery === "Weekday" ? "weekday" : "weekend",
        lat: locationFormData.lat || undefined,
        lng: locationFormData.lng || undefined,
      }

      const updatedRoute = {
        ...viewRoute,
        locations: [...viewRoute.locations, newLocation],
        lastUpdateTime: new Date()
      }

      setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
      setViewRoute(updatedRoute)
      setShowAddLocationDialog(false)
      setLocationFormData({ code: "", location: "", delivery: "Daily", lat: "", lng: "" })
      addToast(`Location ${locationFormData.code} added successfully!`, "success")
    } catch (error) {
      console.error('Error adding location:', error)
      addToast('Failed to add location. Please try again.', 'error')
    }
  }

  const handleAddEmptyRow = async () => {
    if (!viewRoute) return

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: viewRoute.id,
          code: '',
          name: '',
          address: '',
          contact: '',
          notes: '',
          position: viewRoute.locations.length,
          active: true
        })
      })

      if (!response.ok) throw new Error('Failed to create empty row')
      const newLocationData = await response.json()

      const newLocation: Location = {
        id: newLocationData.id,
        no: viewRoute.locations.length + 1,
        code: "",
        location: "",
        delivery: "Not Set",
        deliveryMode: undefined,
        lat: undefined,
        lng: undefined,
      }

      const updatedRoute = {
        ...viewRoute,
        locations: [...viewRoute.locations, newLocation],
        lastUpdateTime: new Date()
      }

      setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
      setViewRoute(updatedRoute)
    } catch (error) {
      console.error('Error adding empty row:', error)
      addToast('Failed to add row. Please try again.', 'error')
    }
  }

  const openEditModal = (route: Route) => {
    setSelectedRoute(route)
    setFormData({
      code: route.code,
      location: route.location,
      delivery: route.delivery,
      shift: route.shift,
    })
    setShowEditModal(true)
  }

  const openDeleteDialog = (route: Route) => {
    setSelectedRoute(route)
    setShowDeleteDialog(true)
  }

  const openViewDialog = (route: Route) => {
    setViewRoute(route)
    setShowViewDialog(true)
    setIsFullscreen(false)
    setSelectedRows(new Set())
  }

  const openDeliveryModal = (location: Location) => {
    setSelectedLocation(location)
    setShowDeliveryModal(true)
  }

  const handleDeliveryModeChange = async (mode: DeliveryMode) => {
    if (!selectedLocation || !viewRoute) return
    
    // Update the location's delivery mode
    const updatedRoute = {
      ...viewRoute,
      locations: viewRoute.locations.map(loc =>
        loc.id === selectedLocation.id
          ? { ...loc, deliveryMode: mode }
          : loc
      ),
      lastUpdateTime: new Date()
    }
    
    // Update routes state
    setRoutes(routes.map(r => 
      r.id === viewRoute.id ? updatedRoute : r
    ))
    
    setViewRoute(updatedRoute)

    // Save to API
    try {
      await fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLocation.id,
          notes: mode // Store delivery mode in notes field temporarily
        })
      })
    } catch (error) {
      console.error('Error updating delivery mode:', error)
    }
  }

  const handleMoveRows = () => {
    if (!viewRoute || selectedRows.size === 0 || !moveDestination.routeId) return

    const rowsToMove = viewRoute.locations.filter(loc => selectedRows.has(loc.id))
    const remainingRows = viewRoute.locations.filter(loc => !selectedRows.has(loc.id))

    // Update current route (remove moved rows)
    const updatedCurrentRoute = {
      ...viewRoute,
      locations: remainingRows,
      lastUpdateTime: new Date()
    }

    // Update destination route (add moved rows)
    const updatedRoutes = routes.map(r => {
      if (r.id === viewRoute.id) {
        return updatedCurrentRoute
      }
      if (r.id === moveDestination.routeId) {
        return {
          ...r,
          locations: [...r.locations, ...rowsToMove.map((loc, idx) => ({
            ...loc,
            id: `${r.id}-${r.locations.length + idx + 1}`,
            no: r.locations.length + idx + 1
          }))],
          lastUpdateTime: new Date()
        }
      }
      return r
    })

    setRoutes(updatedRoutes)
    setViewRoute(updatedCurrentRoute)
    setSelectedRows(new Set())
    setShowMoveDialog(false)
    addToast(`Moved ${rowsToMove.length} row(s) successfully`, "success")
  }

  const toggleSelectAll = () => {
    if (!viewRoute?.locations) return
    if (selectedRows.size === viewRoute.locations.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(viewRoute.locations.map(loc => loc.id)))
    }
  }

  const handleDeleteRows = async () => {
    if (!viewRoute) return
    
    try {
      // Delete each location from database
      const deletePromises = Array.from(rowsToDelete).map(locationId =>
        fetch(`/api/locations?id=${locationId}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const allSuccessful = results.every(r => r.ok)
      
      if (!allSuccessful) throw new Error('Some deletions failed')

      const updatedLocations = viewRoute.locations.filter(loc => !rowsToDelete.has(loc.id))
      // Renumber the remaining locations
      const renumberedLocations = updatedLocations.map((loc, index) => ({
        ...loc,
        no: index + 1
      }))
      
      const updatedRoute = {
        ...viewRoute,
        locations: renumberedLocations,
        lastUpdateTime: new Date()
      }
      
      setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
      setViewRoute(updatedRoute)
      setSelectedRows(new Set())
      setShowDeleteRowsDialog(false)
      setRowsToDelete(new Set())
      addToast(`Deleted ${rowsToDelete.size} row(s) successfully`, "success")
    } catch (error) {
      console.error('Error deleting rows:', error)
      addToast('Failed to delete some rows. Please try again.', 'error')
    }
  }

  const openDeleteRowsDialog = (rowId?: string) => {
    if (rowId) {
      // Single row delete
      setRowsToDelete(new Set([rowId]))
    } else {
      // Multiple rows delete from selection
      if (selectedRows.size === 0) {
        addToast("Please select rows to delete", "warning")
        return
      }
      setRowsToDelete(new Set(selectedRows))
    }
    setShowDeleteRowsDialog(true)
  }

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "AM":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "PM":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  const router = useRouter()

  // Show loading state while fetching data
  if (isLoading) {
    return <LoadingPage text="Loading Selangor routes..." />
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isEditMode) {
                handleExitEditMode()
              } else {
                router.back()
              }
            }}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Selangor</h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? "Edit Mode - Changes auto-saved" : "Manage routes"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isEditMode ? "outline" : "outline"}
              onClick={async () => {
                if (isEditMode) {
                  await handleExitEditMode()
                } else {
                  setIsSwitchingMode(true)
                  await new Promise(resolve => setTimeout(resolve, 300))
                  setIsEditMode(true)
                  setIsSwitchingMode(false)
                }
              }}
              disabled={isSwitchingMode}
              className={cn(
                "gap-2",
                isEditMode && "text-destructive hover:text-destructive"
              )}
            >
              {isSwitchingMode ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
              {isSwitchingMode ? "Switching..." : isEditMode ? "Exit Edit Mode" : "Edit Mode"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Routes Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Add New Route Card */}
          {isEditMode && (
            <Card 
              className="border-2 border-dashed border-muted-foreground/25 hover:border-green-500/50 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all duration-300 hover:scale-105 cursor-pointer group flex items-center justify-center min-h-[180px]"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="rounded-full bg-green-500/10 p-4 group-hover:bg-green-500/20 transition-colors">
                  <Plus className="h-8 w-8 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Add New Route</h3>
                  <p className="text-xs text-muted-foreground mt-1">Click to create</p>
                </div>
              </div>
            </Card>
          )}

          {filteredRoutes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No routes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Get started by adding your first route"}
              </p>
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <Card key={route.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{route.code}</CardTitle>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getShiftColor(route.shift)}`}>
                          {route.shift}
                        </span>
                      </div>
                      <CardDescription className="mt-1">{route.location}</CardDescription>
                    </div>
                    {!isEditMode ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => openViewDialog(route)}
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Menu className="h-4 w-4 text-blue-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openViewDialog(route)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(route)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(route)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <span className="ml-1 font-medium">{route.locations.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-1 font-medium">{getRelativeTime(route.lastUpdateTime)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Route Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription>Create a new route entry for Selangor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Route Code
              </label>
              <Input
                id="code"
                placeholder="e.g., SEL-005"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="location"
                placeholder="e.g., Shah Alam Mall"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="shift" className="text-sm font-medium">
                Shift
              </label>
              <select
                id="shift"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as "AM" | "PM" })}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoute} disabled={!formData.code || !formData.location}>
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Route Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>Update route information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-code" className="text-sm font-medium">
                Route Code
              </label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-location" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-shift" className="text-sm font-medium">
                Shift
              </label>
              <select
                id="edit-shift"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as "AM" | "PM" })}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRoute}>
              <Edit className="h-4 w-4 mr-2" />
              Update Route
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this route? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedRoute.code}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedRoute.location}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteRoute} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Route
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className={`p-0 [&>button]:hidden transition-all ${
          isFullscreen 
            ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] m-0 rounded-none" 
            : "max-w-4xl max-h-[80vh]"
        }`}>
          {/* Custom Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">Route Details - {viewRoute?.code}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Location: {viewRoute?.location}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowColumnCustomize(true)}>
                    Column Customize
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowRowCustomize(true)}>
                    Row Customize
                  </DropdownMenuItem>
                  {isEditMode && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        if (selectedRows.size > 0) {
                          setShowMoveDialog(true)
                        } else {
                          addToast("Please select rows to move", "warning")
                        }
                      }}>
                        Move Rows
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteRowsDialog()}
                        className="text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected Rows
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>
                    Custom Sort
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Table Content */}
          <div className={`overflow-auto px-6 ${
            isFullscreen ? "max-h-[calc(100vh-140px)]" : "max-h-[450px]"
          }`}>
            <Table>
              <TableHeader>
                <TableRow>
                  {isEditMode && (
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={viewRoute?.locations && selectedRows.size === viewRoute.locations.length && viewRoute.locations.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                  )}
                  {visibleColumns.map(col => {
                    if (col.id === 'no') return <TableHead key={col.id} className="w-16">No</TableHead>
                    if (col.id === 'code') return <TableHead key={col.id} className="w-32">Code</TableHead>
                    if (col.id === 'location') return <TableHead key={col.id}>Location</TableHead>
                    if (col.id === 'lat' && isEditMode) return <TableHead key={col.id} className="w-28">Latitude</TableHead>
                    if (col.id === 'lng' && isEditMode) return <TableHead key={col.id} className="w-28">Longitude</TableHead>
                    if (col.id === 'delivery') return <TableHead key={col.id} className="w-40 text-center">Delivery</TableHead>
                    if (col.id === 'action') return <TableHead key={col.id} className="text-center">Action</TableHead>
                    return null
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Data Rows */}
                {sortedLocations.map((item) => {
                  const itemHasDelivery = hasDeliveryToday(item.deliveryMode || "daily")
                  const isDuplicate = checkDuplicate(item.code, item.id)
                  
                  return (
                    <TableRow 
                      key={item.id}
                      className={cn(
                        "transition-opacity",
                        !itemHasDelivery && "opacity-40",
                        isDuplicate && "bg-red-50 dark:bg-red-950/20"
                      )}
                    >
                      {isEditMode && (
                        <TableCell>
                          <Checkbox 
                            checked={selectedRows.has(item.id)}
                            onCheckedChange={() => toggleRowSelection(item.id)}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map(col => renderTableCell(col.id, item, itemHasDelivery, isDuplicate))}
                    </TableRow>
                  )
                })}
                
                {/* Add New Row */}
                {isEditMode && (
                  <TableRow 
                    className="border-2 border-dashed hover:bg-green-50/50 dark:hover:bg-green-950/20 cursor-pointer group"
                    onClick={handleAddEmptyRow}
                  >
                    <TableCell colSpan={visibleColumns.length + (isEditMode ? 1 : 0)} className="h-16">
                      <div className="flex items-center justify-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-2 group-hover:bg-green-500/20 transition-colors">
                          <Plus className="h-4 w-4 text-green-600 dark:text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors">
                          Add New Row
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t">
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Settings Modal */}
      {selectedLocation && (
        <DeliverySettingsModal
          open={showDeliveryModal}
          onOpenChange={setShowDeliveryModal}
          currentMode={selectedLocation.deliveryMode || "daily"}
          onModeChange={handleDeliveryModeChange}
          locationName={selectedLocation.location}
        />
      )}

      {/* Move Rows Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Move Selected Rows</DialogTitle>
            <DialogDescription>
              Move {selectedRows.size} row(s) to another route
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Region Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Region</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={moveDestination.region === "selangor" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setMoveDestination({ ...moveDestination, region: "selangor", routeId: "" })}
                >
                  Selangor
                </Button>
                <Button
                  type="button"
                  variant={moveDestination.region === "kuala-lumpur" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setMoveDestination({ ...moveDestination, region: "kuala-lumpur", routeId: "" })}
                >
                  Kuala Lumpur
                </Button>
              </div>
            </div>

            {/* Route Selection */}
            {moveDestination.region === "selangor" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Destination Route</label>
                <div className="border rounded-lg max-h-[300px] overflow-auto">
                  {routes
                    .filter(r => r.id !== viewRoute?.id)
                    .map((route) => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => setMoveDestination({ ...moveDestination, routeId: route.id })}
                        className={cn(
                          "w-full text-left p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors",
                          moveDestination.routeId === route.id && "bg-primary/10"
                        )}
                      >
                        <div className="font-medium">{route.code}</div>
                        <div className="text-sm text-muted-foreground">{route.location}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {route.locations.length} location(s)
                        </div>
                      </button>
                    ))}
                  {routes.filter(r => r.id !== viewRoute?.id).length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No other routes available in Selangor
                    </div>
                  )}
                </div>
              </div>
            )}

            {moveDestination.region === "kuala-lumpur" && (
              <div className="p-4 border rounded-lg text-center text-sm text-muted-foreground">
                Cross-region move to Kuala Lumpur is not yet supported. Please move within Selangor for now.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveRows}
              disabled={!moveDestination.routeId || moveDestination.region !== "selangor"}
            >
              Move {selectedRows.size} Row(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Rows Confirmation Dialog */}
      <Dialog open={showDeleteRowsDialog} onOpenChange={setShowDeleteRowsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <Trash2 className="h-5 w-5" />
              Delete Row{rowsToDelete.size > 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{rowsToDelete.size}</span> row{rowsToDelete.size > 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">
                ⚠️ The selected row{rowsToDelete.size > 1 ? 's' : ''} will be permanently removed from this route.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowDeleteRowsDialog(false)
              setRowsToDelete(new Set())
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteRows}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {rowsToDelete.size} Row{rowsToDelete.size > 1 ? 's' : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Add a new location to {viewRoute?.code || 'this route'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="loc-code" className="text-sm font-medium">
                Code <span className="text-red-500">*</span>
              </label>
              <Input
                id="loc-code"
                placeholder="e.g., 54"
                value={locationFormData.code}
                onChange={(e) => setLocationFormData({ ...locationFormData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="loc-location" className="text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </label>
              <Input
                id="loc-location"
                placeholder="e.g., KPJ Hospital"
                value={locationFormData.location}
                onChange={(e) => setLocationFormData({ ...locationFormData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="loc-delivery" className="text-sm font-medium">
                Delivery Type
              </label>
              <select
                id="loc-delivery"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={locationFormData.delivery}
                onChange={(e) => setLocationFormData({ ...locationFormData, delivery: e.target.value })}
              >
                <option value="Daily">Daily</option>
                <option value="Alt 1">Alt 1</option>
                <option value="Alt 2">Alt 2</option>
                <option value="Weekday">Weekday</option>
                <option value="Weekend">Weekend</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="loc-lat" className="text-sm font-medium">
                  Latitude
                </label>
                <Input
                  id="loc-lat"
                  type="text"
                  inputMode="decimal"
                  placeholder="3.0000"
                  value={locationFormData.lat}
                  onChange={(e) => setLocationFormData({ ...locationFormData, lat: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="loc-lng" className="text-sm font-medium">
                  Longitude
                </label>
                <Input
                  id="loc-lng"
                  type="text"
                  inputMode="decimal"
                  placeholder="101.0000"
                  value={locationFormData.lng}
                  onChange={(e) => setLocationFormData({ ...locationFormData, lng: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowAddLocationDialog(false)
              setLocationFormData({ code: "", location: "", delivery: "Daily", lat: "", lng: "" })
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddLocation}
              disabled={!locationFormData.code || !locationFormData.location}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Column Customize Modal */}
      <ColumnCustomizeModal
        open={showColumnCustomize}
        onOpenChange={setShowColumnCustomize}
        columns={columnConfig}
        onColumnsChange={setColumnConfig}
      />

      {/* Row Customize Modal */}
      {viewRoute && (
        <RowCustomizeModal
          open={showRowCustomize}
          onOpenChange={setShowRowCustomize}
          rows={viewRoute.locations}
          onApplySort={(sortConfig) => {
            setCustomRowSort(sortConfig)
            addToast("Custom sort applied!", "success")
          }}
          regionKey="selangor"
          currentSort={customRowSort}
        />
      )}
    </PageLayout>
  )
}
