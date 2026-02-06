"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, X } from "lucide-react"
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
import { Input } from "@/components/ui/input"

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

// Sample data - replace with your actual data
const sampleRows: RowData[] = [
  {
    id: "row-1",
    title: "Featured Products",
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        title: "Product 1",
        subtitle: "Premium Quality"
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        title: "Product 2",
        subtitle: "Best Seller"
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
        title: "Product 3",
        subtitle: "New Arrival"
      },
      {
        id: "4",
        url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
        title: "Product 4",
        subtitle: "Limited Edition"
      },
      {
        id: "5",
        url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
        title: "Product 5",
        subtitle: "Special Offer"
      },
    ]
  },
  {
    id: "row-2",
    title: "Popular Items",
    images: [
      {
        id: "6",
        url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
        title: "Item 1",
        subtitle: "Trending"
      },
      {
        id: "7",
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        title: "Item 2",
        subtitle: "Popular"
      },
      {
        id: "8",
        url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
        title: "Item 3",
        subtitle: "Top Rated"
      },
      {
        id: "9",
        url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400",
        title: "Item 4",
        subtitle: "Customer Favorite"
      },
    ]
  },
  {
    id: "row-3",
    title: "Latest Collection",
    images: [
      {
        id: "10",
        url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
        title: "Collection 1",
        subtitle: "2026 Edition"
      },
      {
        id: "11",
        url: "https://images.unsplash.com/photo-1572635196184-84e35138cf62?w=400",
        title: "Collection 2",
        subtitle: "Winter Series"
      },
      {
        id: "12",
        url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400",
        title: "Collection 3",
        subtitle: "Premium Line"
      },
      {
        id: "13",
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
        title: "Collection 4",
        subtitle: "Exclusive"
      },
      {
        id: "14",
        url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400",
        title: "Collection 5",
        subtitle: "Limited Stock"
      },
    ]
  }
]

function HorizontalScrollRow({ 
  title, 
  images, 
  onAddImage 
}: { 
  title: string
  images: ImageItem[]
  onAddImage?: () => void
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
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 px-6 pb-4 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Add Image Button */}
        <div className="flex-shrink-0 w-[200px] md:w-[240px]">
          <Card 
            onClick={onAddImage}
            className="overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-primary" />
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

        {images.map((image) => (
          <div
            key={image.id}
            className="flex-shrink-0 w-[200px] md:w-[240px] group"
          >
            <Card className="overflow-hidden border hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-square overflow-hidden cursor-pointer">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
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
  const [rows, setRows] = useState<RowData[]>(sampleRows)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string>("")
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    subtitle: ""
  })

  const handleAddImage = (rowId: string) => {
    setSelectedRowId(rowId)
    setFormData({ url: "", title: "", subtitle: "" })
    setShowAddDialog(true)
  }

  const handleSubmit = () => {
    if (!formData.url || !formData.title) return

    const newImage: ImageItem = {
      id: Date.now().toString(),
      url: formData.url,
      title: formData.title,
      subtitle: formData.subtitle || undefined
    }

    setRows(prevRows =>
      prevRows.map(row =>
        row.id === selectedRowId
          ? { ...row, images: [...row.images, newImage] }
          : row
      )
    )

    setShowAddDialog(false)
    setFormData({ url: "", title: "", subtitle: "" })
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
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        {rows.map((row) => (
          <HorizontalScrollRow
            key={row.id}
            title={row.title}
            images={row.images}
            onAddImage={() => handleAddImage(row.id)}
          />
        ))}
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

      <style jsx global>{`
        .scroll-smooth::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </PageLayout>
  )
}
