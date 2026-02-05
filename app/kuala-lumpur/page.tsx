"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Eye, Edit, Trash2, FileText, ArrowLeft, Info, Power, Menu, Maximize2 } from "lucide-react"
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
import { cn, getRelativeTime } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

export default function KualaLumpurPage() {
  const { addToast } = useToast()
  const [routes, setRoutes] = useState<Route[]>(initialRoutes)
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
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [moveDestination, setMoveDestination] = useState<{region: string, routeId: string}>({region: "kuala-lumpur", routeId: ""})
  const [showDeleteRowsDialog, setShowDeleteRowsDialog] = useState(false)
  const [rowsToDelete, setRowsToDelete] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    code: "",
    location: "",
    delivery: "Daily",
    shift: "AM" as "AM" | "PM",
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Check for duplicates
  const checkDuplicate = (code: string, currentId: string): boolean => {
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

  // Update location field
  const updateLocationField = (id: string, field: keyof Location, value: string) => {
    if (!viewRoute) return

    const updatedRoute = {
      ...viewRoute,
      locations: viewRoute.locations.map(loc =>
        loc.id === id ? { ...loc, [field]: value } : loc
      )
    }

    setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
    setViewRoute(updatedRoute)
  }

  // Sort locations by delivery availability (with delivery first, without last)
  const sortedLocations = useMemo(() => {
    if (!viewRoute?.locations) return []
    
    return [...viewRoute.locations].sort((a, b) => {
      const aHasDelivery = hasDeliveryToday(a.deliveryMode || "daily")
      const bHasDelivery = hasDeliveryToday(b.deliveryMode || "daily")
      
      if (aHasDelivery === bHasDelivery) return 0
      return aHasDelivery ? -1 : 1 // Items with delivery come first
    })
  }, [viewRoute?.locations])

  const filteredRoutes = routes.filter(
    (route) =>
      route.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateRoute = () => {
    const newRoute: Route = {
      id: String(routes.length + 1),
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
  }

  const handleEditRoute = () => {
    if (!selectedRoute) return
    setRoutes(
      routes.map((m) =>
        m.id === selectedRoute.id
          ? { ...m, code: formData.code, location: formData.location, delivery: formData.delivery, shift: formData.shift }
          : m
      )
    )
    setShowEditModal(false)
    setFormData({ code: "", location: "", delivery: "Daily", shift: "AM" })
    setSelectedRoute(null)
  }

  const handleDeleteRoute = () => {
    if (!selectedRoute) return
    setRoutes(routes.filter((m) => m.id !== selectedRoute.id))
    setShowDeleteDialog(false)
    setSelectedRoute(null)
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

  const handleDeliveryModeChange = (mode: DeliveryMode) => {
    if (!selectedLocation || !viewRoute) return
    
    // Update the location's delivery mode
    const updatedRoute = {
      ...viewRoute,
      locations: viewRoute.locations.map(loc =>
        loc.id === selectedLocation.id
          ? { ...loc, deliveryMode: mode }
          : loc
      )
    }
    
    // Update routes state
    setRoutes(routes.map(r => 
      r.id === viewRoute.id ? updatedRoute : r
    ))
    
    setViewRoute(updatedRoute)
  }

  const toggleSelectAll = () => {
    if (!viewRoute?.locations) return
    if (selectedRows.size === viewRoute.locations.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(viewRoute.locations.map(loc => loc.id)))
    }
  }

  const handleDeleteRows = () => {
    if (!viewRoute) return
    
    const updatedLocations = viewRoute.locations.filter(loc => !rowsToDelete.has(loc.id))
    // Renumber the remaining locations
    const renumberedLocations = updatedLocations.map((loc, index) => ({
      ...loc,
      no: index + 1
    }))
    
    const updatedRoute = {
      ...viewRoute,
      locations: renumberedLocations
    }
    
    setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
    setViewRoute(updatedRoute)
    setSelectedRows(new Set())
    setShowDeleteRowsDialog(false)
    setRowsToDelete(new Set())
    addToast(`Deleted ${rowsToDelete.size} row(s) successfully`, "success")
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

  const handleMoveRows = () => {
    if (!viewRoute || !moveDestination.routeId) return
    
    const destinationRoute = routes.find(r => r.id === moveDestination.routeId)
    if (!destinationRoute) return

    // Get selected row data
    const selectedLocations = viewRoute.locations.filter(loc => selectedRows.has(loc.id))
    
    // Remove from current route
    const updatedCurrentRoute = {
      ...viewRoute,
      locations: viewRoute.locations
        .filter(loc => !selectedRows.has(loc.id))
        .map((loc, index) => ({ ...loc, no: index + 1 }))
    }

    // Add to destination route with new IDs
    const maxNo = destinationRoute.locations.length
    const newLocations = selectedLocations.map((loc, index) => ({
      ...loc,
      id: `${destinationRoute.id}-${maxNo + index + 1}`,
      no: maxNo + index + 1
    }))

    const updatedDestinationRoute = {
      ...destinationRoute,
      locations: [...destinationRoute.locations, ...newLocations]
    }

    // Update routes
    setRoutes(routes.map(r => {
      if (r.id === viewRoute.id) return updatedCurrentRoute
      if (r.id === moveDestination.routeId) return updatedDestinationRoute
      return r
    }))

    setViewRoute(updatedCurrentRoute)
    setSelectedRows(new Set())
    setShowMoveDialog(false)
    addToast(`Moved ${selectedLocations.length} row(s) to ${destinationRoute.code}`, "success")
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
                setIsEditMode(false)
              } else {
                router.back()
              }
            }}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Kuala Lumpur</h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? "Edit Mode - Make your changes" : "Manage routes"}
            </p>
          </div>
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
          </Button>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openViewDialog(route)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {isEditMode && (
                          <>
                            <DropdownMenuItem onClick={() => openEditModal(route)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(route)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <DialogDescription>Create a new route entry for Kuala Lumpur.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Route Code
              </label>
              <Input
                id="code"
                placeholder="e.g., KL-006"
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
                placeholder="e.g., KLCC"
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
                  <DropdownMenuItem>
                    Column Customize
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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
            isFullscreen ? "max-h-[calc(100vh-140px)]" : "max-h-[60vh]"
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
                  <TableHead className="w-16">No</TableHead>
                  <TableHead className="w-32">Code</TableHead>
                  <TableHead>Location</TableHead>
                  {isEditMode && (
                    <>
                      <TableHead className="w-28">Latitude</TableHead>
                      <TableHead className="w-28">Longitude</TableHead>
                    </>
                  )}
                  <TableHead className="w-40 text-center">Delivery</TableHead>
                  <TableHead className="text-center">Action</TableHead>
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
                      <TableCell className="font-medium">{item.no}</TableCell>
                      <TableCell>
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
                      <TableCell>
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
                      {isEditMode && (
                        <>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="0.0000"
                              value={item.lat || ''}
                              onChange={(e) => updateLocationField(item.id, 'lat', e.target.value)}
                              className="h-8 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="0.0000"
                              value={item.lng || ''}
                              onChange={(e) => updateLocationField(item.id, 'lng', e.target.value)}
                              className="h-8 text-center"
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-center">
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
                            
                            updateLocationField(item.id, 'delivery', deliveryValue)
                            
                            if (!viewRoute) return
                            const updatedRoute = {
                              ...viewRoute,
                              locations: viewRoute.locations.map(loc =>
                                loc.id === item.id ? { ...loc, deliveryMode: mode } : loc
                              )
                            }
                            setRoutes(routes.map(r => r.id === viewRoute.id ? updatedRoute : r))
                            setViewRoute(updatedRoute)
                          }}
                          className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
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
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <InfoModal
                            title={`Maklumat ${item.code} - ${item.location}`}
                            defaultDescriptions={[
                              `Code: ${item.code}`,
                              `Location: ${item.location}`,
                              `Latitude: ${item.lat || 'Not set'}`,
                              `Longitude: ${item.lng || 'Not set'}`,
                              `Delivery Type: ${item.delivery}`,
                              `Route: ${viewRoute?.name || 'N/A'} (${viewRoute?.shift || 'N/A'})`,
                              `Delivery Today: ${itemHasDelivery ? 'Yes' : 'No'}`
                            ]}
                            lat={item.lat}
                            lng={item.lng}
                            onGenerateQR={() => {
                              addToast(`QR Code for ${item.code} generated!`, "success")
                            }}
                            triggerVariant="ghost"
                            isEditMode={isEditMode}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-8 w-8",
                              itemHasDelivery ? "text-green-600 hover:text-green-700 dark:text-green-500" : "text-red-600 hover:text-red-700 dark:text-red-500"
                            )}
                            onClick={() => {
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
                    </TableRow>
                  )
                })}
                
                {/* Add New Row */}
                {isEditMode && (
                  <TableRow className="border-2 border-dashed hover:bg-green-50/50 dark:hover:bg-green-950/20 cursor-pointer group">
                    <TableCell colSpan={isEditMode ? 8 : 6} className="h-16">
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
            {moveDestination.region === "kuala-lumpur" && (
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
                      No other routes available in Kuala Lumpur
                    </div>
                  )}
                </div>
              </div>
            )}

            {moveDestination.region === "selangor" && (
              <div className="p-4 border rounded-lg text-center text-sm text-muted-foreground">
                Cross-region move to Selangor is not yet supported. Please move within Kuala Lumpur for now.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveRows}
              disabled={!moveDestination.routeId || moveDestination.region !== "kuala-lumpur"}
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
    </PageLayout>
  )
}
