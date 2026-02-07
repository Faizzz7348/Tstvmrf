import { NextRequest, NextResponse } from 'next/server'
import { 
  createLocation, 
  updateLocation, 
  deleteLocation,
  bulkCreateLocations 
} from '@/lib/prisma-db'

/**
 * POST /api/locations
 * Create a new location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { routeId, code, name, address, contact, notes, position, active } = body

    if (!routeId || !code || !name) {
      return NextResponse.json(
        { error: 'RouteId, code, and name are required' },
        { status: 400 }
      )
    }

    const location = await createLocation({
      routeId,
      code,
      name,
      address,
      contact,
      notes,
      position,
      active,
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/locations:', error)
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/locations
 * Update an existing location
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    const location = await updateLocation(id, data)
    return NextResponse.json(location)
  } catch (error) {
    console.error('Error in PATCH /api/locations:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/locations?id=xxx
 * Delete a location (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    await deleteLocation(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/locations:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
