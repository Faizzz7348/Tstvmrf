import { NextRequest, NextResponse } from 'next/server'
import { 
  createGalleryImage, 
  updateGalleryImage, 
  deleteGalleryImage,
  bulkCreateGalleryImages,
  reorderGalleryImages 
} from '@/lib/prisma-db'
import { withDatabaseAndRateLimit } from '@/lib/api-middleware'

/**
 * POST /api/gallery/images
 * Create a new gallery image
 */
export const POST = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { rowId, url, title, subtitle, position, active, bulk, images } = body

  // Handle bulk creation
  if (bulk && images && Array.isArray(images)) {
    if (!rowId) {
      return NextResponse.json(
        { error: 'RowId is required for bulk creation' },
        { status: 400 }
      )
    }
    await bulkCreateGalleryImages(rowId, images)
    return NextResponse.json({ success: true }, { status: 201 })
  }

  // Handle single creation
  if (!rowId || !url || !title) {
    return NextResponse.json(
      { error: 'RowId, url, and title are required' },
      { status: 400 }
    )
  }

  const image = await createGalleryImage({
    rowId,
    url,
    title,
    subtitle,
    position,
    active,
  })

  return NextResponse.json(image, { status: 201 })
})

/**
 * PATCH /api/gallery/images
 * Update an existing gallery image
 */
export const PATCH = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Image ID is required' },
      { status: 400 }
    )
  }

  const image = await updateGalleryImage(id, data)
  return NextResponse.json(image)
})

/**
 * DELETE /api/gallery/images?id=xxx
 * Delete a gallery image (soft delete)
 */
export const DELETE = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Image ID is required' },
      { status: 400 }
    )
  }

  await deleteGalleryImage(id)
  return NextResponse.json({ success: true })
})

/**
 * PUT /api/gallery/images (for reordering)
 * Reorder images within a gallery row
 */
export const PUT = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { imageIds } = body

  if (!imageIds || !Array.isArray(imageIds)) {
    return NextResponse.json(
      { error: 'ImageIds array is required' },
      { status: 400 }
    )
  }

  await reorderGalleryImages(imageIds)
  return NextResponse.json({ success: true })
})
