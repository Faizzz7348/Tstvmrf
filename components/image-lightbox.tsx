"use client"

import { useRef } from "react"

// Global variable to track current open gallery
let currentOpenGallery: any = null

interface ImageLightboxProps {
  images: Array<{ url: string; title?: string; subtitle?: string } | string>
  currentIndex?: number
  trigger?: React.ReactNode
}

export function ImageLightbox({ images, currentIndex = 0, trigger }: ImageLightboxProps) {
  const galleryRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  const handleImageClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Close any currently open gallery
    if (currentOpenGallery && currentOpenGallery !== galleryRef.current) {
      try {
        currentOpenGallery.destroy()
        currentOpenGallery = null
      } catch (err) {
        console.warn("Error closing previous gallery:", err)
      }
    }

    // Initialize gallery if not already done
    if (!isInitialized.current && containerRef.current) {
      try {
        // Dynamically import lightgallery and its plugins
        const { default: lightGallery } = await import("lightgallery")
        const lgThumbnail = await import("lightgallery/plugins/thumbnail")
        const lgZoom = await import("lightgallery/plugins/zoom")
        const lgFullscreen = await import("lightgallery/plugins/fullscreen")

        // Import CSS files (correct way for webpack)
        require("lightgallery/css/lightgallery.css")
        require("lightgallery/css/lg-thumbnail.css")
        require("lightgallery/css/lg-zoom.css")
        require("lightgallery/css/lg-fullscreen.css")

        // Initialize gallery
        const gallery = lightGallery(containerRef.current, {
          licenseKey: "GPLv3",
          plugins: [lgThumbnail.default, lgZoom.default, lgFullscreen.default],
          speed: 500,
          download: false,
          dynamic: true,
          dynamicEl: images.map((img, idx) => {
            const imageObj = typeof img === 'object' ? img : { url: img }
            return {
              src: imageObj.url,
              thumb: imageObj.url,
              subHtml: imageObj.title 
                ? `<h4>${imageObj.title}</h4>${imageObj.subtitle ? `<p>${imageObj.subtitle}</p>` : ''}` 
                : `<p>Image ${idx + 1}</p>`
            }
          }),
          thumbnail: true,
          animateThumb: true,
          thumbWidth: 100,
          thumbHeight: "80px",
          thumbMargin: 5,
          mode: "lg-fade",
          closable: true,
          closeOnTap: true,
        })

        galleryRef.current = gallery
        currentOpenGallery = gallery
        isInitialized.current = true

        // Use the correct lightGallery event listener API
        gallery.LGel.on('lgAfterClose', () => {
          if (currentOpenGallery === gallery) {
            currentOpenGallery = null
          }
        })

        // Open gallery at the specified index
        setTimeout(() => gallery.openGallery(currentIndex), 100)
      } catch (error) {
        console.error("Failed to load LightGallery:", error)
      }
    } else if (galleryRef.current) {
      // Gallery already initialized, just open it at the current index
      currentOpenGallery = galleryRef.current
      galleryRef.current.openGallery(currentIndex)
    }
  }

  return (
    <div ref={containerRef} onClick={handleImageClick} className="cursor-pointer">
      {trigger || <div className="w-full h-full" />}
    </div>
  )
}

export default ImageLightbox
