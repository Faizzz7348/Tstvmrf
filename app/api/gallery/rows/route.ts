import { NextRequest, NextResponse } from 'next/server'
import { 
  getGalleryRows, 
  createGalleryRow, 
  updateGalleryRow, 
  deleteGalleryRow,
  reorderGalleryRows 
} from '@/lib/prisma-db'

/**
 * GET /api/gallery/rows
 * Get all gallery rows with images
 */
export async function GET() {
  try {
    const rows = await getGalleryRows()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error in GET /api/gallery/rows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery rows' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gallery/rows
 * Create a new gallery row
 */
export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error in POST /api/gallery/rows:', error)
    return NextResponse.json(
      { error: 'Failed to create gallery row' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/gallery/rows
 * Update an existing gallery row
 */
export async function PATCH(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error in PATCH /api/gallery/rows:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery row' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gallery/rows?id=xxx
 * Delete a gallery row (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error in DELETE /api/gallery/rows:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery row' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gallery/rows (for reordering)
 * Reorder gallery rows
 */
export async function PUT(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error in PUT /api/gallery/rows:', error)
    return NextResponse.json(
      { error: 'Failed to reorder gallery rows' },
      { status: 500 }
    )
  }
}
