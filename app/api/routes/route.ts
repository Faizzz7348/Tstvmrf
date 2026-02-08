import { NextRequest, NextResponse } from 'next/server'
import { 
  getRoutesByRegion, 
  createRoute, 
  updateRoute, 
  deleteRoute,
  DatabaseError,
} from '@/lib/prisma-db'
import { withDatabaseAndRateLimit } from '@/lib/api-middleware'

/**
 * GET /api/routes?region=selangor
 * Get all routes for a specific region
 */
export const GET = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const region = searchParams.get('region')

  if (!region) {
    return NextResponse.json(
      { error: 'Region parameter is required' },
      { status: 400 }
    )
  }

  const routes = await getRoutesByRegion(region)
  return NextResponse.json(routes)
})

/**
 * POST /api/routes
 * Create a new route
 */
export const POST = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { code, name, description, region, active } = body

  if (!code || !name || !region) {
    return NextResponse.json(
      { error: 'Code, name, and region are required' },
      { status: 400 }
    )
  }

  const route = await createRoute({
    code,
    name,
    description,
    region,
    active,
  })

  return NextResponse.json(route, { status: 201 })
})

/**
 * PATCH /api/routes
 * Update an existing route
 */
export const PATCH = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Route ID is required' },
      { status: 400 }
    )
  }

  const route = await updateRoute(id, data)
  return NextResponse.json(route)
})

/**
 * DELETE /api/routes?id=xxx
 * Delete a route (soft delete)
 */
export const DELETE = withDatabaseAndRateLimit(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Route ID is required' },
      { status: 400 }
    )
  }

  await deleteRoute(id)
  return NextResponse.json({ success: true })
})
