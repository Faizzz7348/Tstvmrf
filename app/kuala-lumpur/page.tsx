"use client"

import { useState } from "react"
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
import { Route, initialRoutes } from "./data"

export default function KualaLumpurPage() {
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
  const [formData, setFormData] = useState({
    code: "",
    location: "",
    delivery: "Daily",
    shift: "AM" as "AM" | "PM",
  })

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
      lastUpdate: "Just now",
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

  const toggleSelectAll = () => {
    if (!viewRoute?.locations) return
    if (selectedRows.size === viewRoute.locations.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(viewRoute.locations.map(loc => loc.id)))
    }
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

  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Kuala Lumpur</h1>
            <p className="text-sm text-muted-foreground">Manage routes</p>
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
          <Card 
            className="border-2 border-dashed border-muted-foreground/25 hover:border-green-500/50 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all cursor-pointer group flex items-center justify-center min-h-[180px]"
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
              <Card key={route.id} className="group hover:shadow-lg transition-shadow">
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
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Delivery:</span>
                      <span className="ml-1 font-medium">{route.delivery}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-1 font-medium">{route.lastUpdate}</span>
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
                Location
              </label>
              <Input
                id="location"
                placeholder="e.g., KLCC"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="delivery" className="text-sm font-medium">
                Delivery Schedule
              </label>
              <select
                id="delivery"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.delivery}
                onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
              >
                <option value="Daily">Daily</option>
                <option value="Weekday">Weekday</option>
                <option value="Alt 1">Alt 1</option>
                <option value="Alt 2">Alt 2</option>
              </select>
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
                Location
              </label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-delivery" className="text-sm font-medium">
                Delivery Schedule
              </label>
              <select
                id="edit-delivery"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.delivery}
                onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
              >
                <option value="Daily">Daily</option>
                <option value="Weekday">Weekday</option>
                <option value="Alt 1">Alt 1</option>
                <option value="Alt 2">Alt 2</option>
              </select>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Move Rows
                  </DropdownMenuItem>
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
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={viewRoute?.locations && selectedRows.size === viewRoute.locations.length && viewRoute.locations.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-center text-red-700 dark:text-red-500">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Data Rows */}
                {viewRoute?.locations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedRows.has(item.id)}
                        onCheckedChange={() => toggleRowSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.no}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.delivery}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Add New Row */}
                <TableRow className="border-2 border-dashed hover:bg-green-50/50 dark:hover:bg-green-950/20 cursor-pointer group">
                  <TableCell colSpan={6} className="h-16">
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
              </TableBody>
            </Table>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t">
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
