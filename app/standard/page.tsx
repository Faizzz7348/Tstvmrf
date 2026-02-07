"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, MoreVertical, Pencil, Trash2, ArrowUp, ArrowDown, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageLayout } from "@/components/page-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ImageLightbox } from "@/components/image-lightbox"

interface ImageItem {
  id: string
  url: string
  title: string
  subtitle?: string
}

interface RowData {
  id: string
  title: string
  images: ImageItem[]
}

function HorizontalScrollRow({ 
  title, 
  images, 
  onAddImage,
  onEditTitle,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  editMode,
  onEditImage,
  onDeleteImage,
  onPreviewImage
}: { 
  title: string
  images: ImageItem[]
  onAddImage?: () => void
  onEditTitle?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  editMode?: boolean
  onEditImage?: (imageId: string) => void
  onDeleteImage?: (imageId: string) => void
  onPreviewImage?: (imageIndex: number) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const element = scrollRef.current
    if (element) {
      element.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
      return () => {
        element.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [images])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 2
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="py-8 border-b">
      <div className="flex items-center justify-between mb-6 px-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Three Dots Menu - Only visible in Edit Mode */}
          {editMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEditTitle} className="gap-2 cursor-pointer">
                  <Pencil className="w-4 h-4" />
                  Edit Title
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onMoveUp} 
                  disabled={!canMoveUp}
                  className="gap-2 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                  Move Up
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onMoveDown} 
                  disabled={!canMoveDown}
                  className="gap-2 cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4" />
                  Move Down
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Row
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 px-6 pb-4 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Add Image Button - Only visible in Edit Mode */}
        {editMode && (
          <div className="flex-shrink-0 w-[200px] md:w-[240px]">
            <Card 
              onClick={onAddImage}
              className="overflow-hidden border-2 border-dashed border-green-300 hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer bg-transparent"
            >
              <div className="relative aspect-square overflow-hidden flex items-center justify-center bg-transparent hover:bg-green-50/50 transition-colors">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Add Image</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-center text-muted-foreground">
                  Click to add new image
                </p>
              </div>
            </Card>
          </div>
        )}

        {images.map((image, index) => (
          <div
            key={image.id}
            className="flex-shrink-0 w-[200px] md:w-[240px] group"
          >
            <Card className="overflow-hidden border hover:shadow-lg transition-all duration-300">
              {editMode ? (
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Action Buttons Overlay in Edit Mode */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-10 h-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreviewImage?.(index)
                      }}
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-10 h-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditImage?.(image.id)
                      }}
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-10 h-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteImage?.(image.id)
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <ImageLightbox
                  images={images.map(img => ({
                    url: img.url,
                    title: img.title,
                    subtitle: img.subtitle
                  }))}
                  currentIndex={index}
                  trigger={
                    <div className="relative aspect-square overflow-hidden cursor-pointer">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  }
                />
              )}
              <div className="p-4">
                <h3 className="font-medium text-sm truncate">{image.title}</h3>
                {image.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {image.subtitle}
                  </p>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StandardPage() {
  const router = useRouter()
  const [rows, setRows] = useState<RowData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAddRowDialog, setShowAddRowDialog] = useState(false)
  const [showEditTitleDialog, setShowEditTitleDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditImageDialog, setShowEditImageDialog] = useState(false)
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string>("")
  const [selectedImageId, setSelectedImageId] = useState<string>("")
  const [editingRowTitle, setEditingRowTitle] = useState("")
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    subtitle: ""
  })
  const [newRowTitle, setNewRowTitle] = useState("")

  // Load gallery rows from API
  useEffect(() => {
    async function loadGalleryRows() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/gallery/rows')
        if (!response.ok) throw new Error('Failed to fetch gallery rows')
        const data = await response.json()
        
        // Transform API data to match RowData structure
        const transformedRows: RowData[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          images: row.images?.map((img: any) => ({
            id: img.id,
            url: img.url,
            title: img.title,
            subtitle: img.subtitle
          })) || []
        }))
        
        setRows(transformedRows)
      } catch (error) {
        console.error('Error loading gallery rows:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGalleryRows()
  }, [])

  const handleAddImage = (rowId: string) => {
    setSelectedRowId(rowId)
    setFormData({ url: "", title: "", subtitle: "" })
    setShowAddDialog(true)
  }

  const handleAddRow = () => {
    setNewRowTitle("")
    setShowAddRowDialog(true)
  }

  const handleSubmitNewRow = async () => {
    if (!newRowTitle.trim()) return

    try {
      const response = await fetch('/api/gallery/rows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newRowTitle })
      })

      if (!response.ok) throw new Error('Failed to create row')
      const newRow = await response.json()

      setRows(prevRows => [...prevRows, {
        id: newRow.id,
        title: newRow.title,
        images: []
      }])
      setShowAddRowDialog(false)
      setNewRowTitle("")
    } catch (error) {
      console.error('Error creating row:', error)
      alert('Failed to create row. Please try again.')
    }
  }

  const handleSubmit = async () => {
    if (!formData.url || !formData.title) return

    try {
      const response = await fetch('/api/gallery/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowId: selectedRowId,
          url: formData.url,
          title: formData.title,
          subtitle: formData.subtitle || undefined
        })
      })

      if (!response.ok) throw new Error('Failed to add image')
      const newImage = await response.json()

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === selectedRowId
            ? { ...row, images: [...row.images, {
                id: newImage.id,
                url: newImage.url,
                title: newImage.title,
                subtitle: newImage.subtitle
              }] }
            : row
        )
      )

      setShowAddDialog(false)
      setFormData({ url: "", title: "", subtitle: "" })
    } catch (error) {
      console.error('Error adding image:', error)
      alert('Failed to add image. Please try again.')
    }
  }

  const handleEditTitle = (rowId: string) => {
    const row = rows.find(r => r.id === rowId)
    if (row) {
      setSelectedRowId(rowId)
      setEditingRowTitle(row.title)
      setShowEditTitleDialog(true)
    }
  }

  const handleSubmitEditTitle = async () => {
    if (!editingRowTitle.trim()) return

    try {
      const response = await fetch('/api/gallery/rows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRowId, title: editingRowTitle })
      })

      if (!response.ok) throw new Error('Failed to update title')

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === selectedRowId
            ? { ...row, title: editingRowTitle }
            : row
        )
      )

      setShowEditTitleDialog(false)
      setEditingRowTitle("")
      setSelectedRowId("")
    } catch (error) {
      console.error('Error updating title:', error)
      alert('Failed to update title. Please try again.')
    }
  }

  const handleDeleteRow = (rowId: string) => {
    setSelectedRowId(rowId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/gallery/rows?id=${selectedRowId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete row')

      setRows(prevRows => prevRows.filter(row => row.id !== selectedRowId))
      setShowDeleteDialog(false)
      setSelectedRowId("")
    } catch (error) {
      console.error('Error deleting row:', error)
      alert('Failed to delete row. Please try again.')
    }
  }

  const handleMoveRowUp = (rowId: string) => {
    const index = rows.findIndex(r => r.id === rowId)
    if (index > 0) {
      const newRows = [...rows]
      const temp = newRows[index]
      newRows[index] = newRows[index - 1]
      newRows[index - 1] = temp
      setRows(newRows)
    }
  }

  const handleMoveRowDown = (rowId: string) => {
    const index = rows.findIndex(r => r.id === rowId)
    if (index < rows.length - 1) {
      const newRows = [...rows]
      const temp = newRows[index]
      newRows[index] = newRows[index + 1]
      newRows[index + 1] = temp
      setRows(newRows)
    }
  }

  const handleEditImage = (rowId: string, imageId: string) => {
    const row = rows.find(r => r.id === rowId)
    const image = row?.images.find(img => img.id === imageId)
    if (image) {
      setSelectedRowId(rowId)
      setSelectedImageId(imageId)
      setFormData({
        url: image.url,
        title: image.title,
        subtitle: image.subtitle || ""
      })
      setShowEditImageDialog(true)
    }
  }

  const handleSubmitEditImage = async () => {
    if (!formData.url || !formData.title) return

    try {
      const response = await fetch('/api/gallery/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedImageId,
          url: formData.url,
          title: formData.title,
          subtitle: formData.subtitle || undefined
        })
      })

      if (!response.ok) throw new Error('Failed to update image')

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === selectedRowId
            ? {
                ...row,
                images: row.images.map(img =>
                  img.id === selectedImageId
                    ? {
                        ...img,
                        url: formData.url,
                        title: formData.title,
                        subtitle: formData.subtitle || undefined
                      }
                    : img
                )
              }
            : row
        )
      )

      setShowEditImageDialog(false)
      setFormData({ url: "", title: "", subtitle: "" })
      setSelectedImageId("")
      setSelectedRowId("")
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Failed to update image. Please try again.')
    }
  }

  const handleDeleteImage = (rowId: string, imageId: string) => {
    setSelectedRowId(rowId)
    setSelectedImageId(imageId)
    setShowDeleteImageDialog(true)
  }

  const handleConfirmDeleteImage = async () => {
    try {
      const response = await fetch(`/api/gallery/images?id=${selectedImageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete image')

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === selectedRowId
            ? {
                ...row,
                images: row.images.filter(img => img.id !== selectedImageId)
              }
            : row
        )
      )

      setShowDeleteImageDialog(false)
      setSelectedImageId("")
      setSelectedRowId("")
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image. Please try again.')
    }
  }

  const handlePreviewImage = (rowId: string, imageIndex: number) => {
    const row = rows.find(r => r.id === rowId)
    if (row && row.images[imageIndex]) {
      // Create a temporary lightbox trigger
      const images = row.images.map(img => ({
        url: img.url,
        title: img.title,
        subtitle: img.subtitle
      }))
      // We'll need to implement this differently since we can't directly trigger lightbox
      // For now, just open in new tab as fallback
      window.open(row.images[imageIndex].url, '_blank')
    }
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Sticky Header */}
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
            <h1 className="text-xl font-semibold">Standard Gallery</h1>
            <p className="text-sm text-muted-foreground">
              Browse through our horizontal scrolling image galleries
            </p>
          </div>
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {editMode ? "Exit Edit Mode" : "Edit Mode"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        {rows.map((row, index) => (
          <HorizontalScrollRow
            key={row.id}
            title={row.title}
            images={row.images}
            editMode={editMode}
            onAddImage={() => handleAddImage(row.id)}
            onEditTitle={() => handleEditTitle(row.id)}
            onDelete={() => handleDeleteRow(row.id)}
            onMoveUp={() => handleMoveRowUp(row.id)}
            onMoveDown={() => handleMoveRowDown(row.id)}
            onEditImage={(imageId) => handleEditImage(row.id, imageId)}
            onDeleteImage={(imageId) => handleDeleteImage(row.id, imageId)}
            onPreviewImage={(imageIndex) => handlePreviewImage(row.id, imageIndex)}
            canMoveUp={index > 0}
            canMoveDown={index < rows.length - 1}
          />
        ))}
        
        {/* Add New Row Button - Only visible in Edit Mode */}
        {editMode && (
          <div className="flex justify-center py-12">
            <Button
              onClick={handleAddRow}
              variant="outline"
              size="lg"
              className="gap-2 border-dashed border-2 border-green-300 text-green-600 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              <Plus className="w-5 h-5" />
              Add New Row
            </Button>
          </div>
        )}
      </div>

      {/* Add Image Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Image</DialogTitle>
            <DialogDescription>
              Add a new image to the gallery row
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter image title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtitle (Optional)</label>
              <Input
                placeholder="Enter image subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            {formData.url && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={formData.url}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.url || !formData.title}
            >
              Add Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Row Dialog */}
      <Dialog open={showAddRowDialog} onOpenChange={setShowAddRowDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Row</DialogTitle>
            <DialogDescription>
              Create a new gallery row with a title
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Row Title</label>
              <Input
                placeholder="Enter row title (e.g., New Collection)"
                value={newRowTitle}
                onChange={(e) => setNewRowTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newRowTitle.trim()) {
                    handleSubmitNewRow()
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddRowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNewRow}
              disabled={!newRowTitle.trim()}
            >
              Create Row
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Title Dialog */}
      <Dialog open={showEditTitleDialog} onOpenChange={setShowEditTitleDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Row Title</DialogTitle>
            <DialogDescription>
              Update the title for this gallery row
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Row Title</label>
              <Input
                placeholder="Enter row title"
                value={editingRowTitle}
                onChange={(e) => setEditingRowTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editingRowTitle.trim()) {
                    handleSubmitEditTitle()
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditTitleDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEditTitle}
              disabled={!editingRowTitle.trim()}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Row</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this row? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={showEditImageDialog} onOpenChange={setShowEditImageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Update the image details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter image title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtitle (Optional)</label>
              <Input
                placeholder="Enter image subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            {formData.url && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={formData.url}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditImageDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEditImage}
              disabled={!formData.url || !formData.title}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Image Confirmation Dialog */}
      <Dialog open={showDeleteImageDialog} onOpenChange={setShowDeleteImageDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteImageDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteImage}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scroll-smooth::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </PageLayout>
  )
}
