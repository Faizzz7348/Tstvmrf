import { NextRequest, NextResponse } from 'next/server'
import { 
  getGalleryRows, 
  createGalleryRow, 
  updateGalleryRow, 
  deleteGalleryRow,
  reorderGalleryRows 
} from '@/lib/prisma-db'
import { withDatabaseAndRateLimit } from '@/lib/api-middleware'

/**
 * GET /api/gallery/rows
 * Get all gallery rows with images
 */
export const GET = withDatabaseAndRateLimit(async () => {
  const rows = await getGalleryRows()
  return NextResponse.json(rows)
})

/**
 * POST /api/gallery/rows
 * Create a new gallery row
 */
export const POST = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { title, position, active } = body

  if (!title) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    )
  }

  const row = await createGalleryRow({
    title,
    position,
    active,
  })

  return NextResponse.json(row, { status: 201 })
})

/**
 * PATCH /api/gallery/rows
 * Update an existing gallery row
 */
export const PATCH = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Row ID is required' },
      { status: 400 }
    )
  }

  const row = await updateGalleryRow(id, data)
  return NextResponse.json(row)
})

/**
 * DELETE /api/gallery/rows?id=xxx
 * Delete a gallery row (soft delete)
 */
export const DELETE = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Row ID is required' },
      { status: 400 }
    )
  }

  await deleteGalleryRow(id)
  return NextResponse.json({ success: true })
})

/**
 * PUT /api/gallery/rows (for reordering)
 * Reorder gallery rows
 */
export const PUT = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { rowIds } = body

  if (!rowIds || !Array.isArray(rowIds)) {
    return NextResponse.json(
      { error: 'RowIds array is required' },
      { status: 400 }
    )
  }

  await reorderGalleryRows(rowIds)
  return NextResponse.json({ success: true })
})
