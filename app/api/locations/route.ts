import { NextRequest, NextResponse } from 'next/server'
import { 
  createLocation, 
  updateLocation, 
  deleteLocation,
  bulkCreateLocations 
} from '@/lib/prisma-db'
import { withDatabaseAndRateLimit } from '@/lib/api-middleware'

/**
 * POST /api/locations
 * Create a new location
 */
export const POST = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { routeId, code, name, address, contact, notes, position, active } = body

  if (!routeId) {
    return NextResponse.json(
      { error: 'RouteId is required', received: { routeId } },
      { status: 400 }
    )
  }

  // Allow empty code and name for inline editing - use placeholder if empty
  const locationData = {
    routeId,
    code: code || '---',
    name: name || 'New Location',
    address: address || undefined,
    contact: contact || undefined,
    notes: notes || undefined,
    position: position ?? 0,
    active: active ?? true,
  }

  const location = await createLocation(locationData)

  return NextResponse.json(location, { status: 201 })
})

/**
 * PATCH /api/locations
 * Update an existing location
 */
export const PATCH = withDatabaseAndRateLimit(async (request: NextRequest) => {
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
})

/**
 * DELETE /api/locations?id=xxx
 * Delete a location (soft delete)
 */
export const DELETE = withDatabaseAndRateLimit(async (request: NextRequest) => {
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
})
