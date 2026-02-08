import { prisma, isDatabaseConnected } from './prisma'
import type { Route as PrismaRoute, Location as PrismaLocation, DeliverySchedule, GalleryRow, GalleryImage } from '@prisma/client'
import { Prisma } from '@prisma/client'

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Handle Prisma errors with better error messages
 */
export function handlePrismaError(error: unknown, operation: string): never {
  console.error(`Database error during ${operation}:`, error)

  // If it's already a DatabaseError, just re-throw it
  if (error instanceof DatabaseError) {
    throw error
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma error codes
    switch (error.code) {
      case 'P2002':
        const field = Array.isArray(error.meta?.target) ? error.meta.target[0] : error.meta?.target
        const fieldName = field === 'code' ? 'Route code' : field || 'unknown field'
        throw new DatabaseError(
          `${fieldName} already exists. Please use a different ${field || 'value'}.`,
          error.code,
          error
        )
      case 'P2003':
        throw new DatabaseError(
          'Foreign key constraint failed',
          error.code,
          error
        )
      case 'P2025':
        throw new DatabaseError(
          'Record not found',
          error.code,
          error
        )
      case 'P1001':
        throw new DatabaseError(
          'Cannot reach database server',
          error.code,
          error
        )
      case 'P1008':
        throw new DatabaseError(
          'Operations timed out',
          error.code,
          error
        )
      default:
        throw new DatabaseError(
          `Database operation failed: ${error.message}`,
          error.code,
          error
        )
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new DatabaseError(
      'Unknown database error occurred',
      'UNKNOWN',
      error
    )
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new DatabaseError(
      'Database client crashed',
      'PANIC',
      error
    )
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new DatabaseError(
      'Failed to initialize database connection',
      'INIT_ERROR',
      error
    )
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseError(
      'Invalid data provided',
      'VALIDATION_ERROR',
      error
    )
  }

  // Generic error
  throw new DatabaseError(
    `Operation failed: ${operation}`,
    'UNKNOWN',
    error
  )
}

/**
 * Retry a database operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on validation errors or unique constraint violations
      if (
        error instanceof Prisma.PrismaClientValidationError ||
        (error instanceof Prisma.PrismaClientKnownRequestError && 
         ['P2002', 'P2003', 'P2025'].includes(error.code))
      ) {
        throw error
      }

      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1)
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Execute database operation with connection check and retry
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    // Check connection first
    const connected = await isDatabaseConnected()
    if (!connected) {
      throw new DatabaseError(
        'Database is not connected',
        'NOT_CONNECTED'
      )
    }

    return await retryOperation(operation)
  } catch (error) {
    return handlePrismaError(error, operationName)
  }
}

// ============================================
// ROUTES & LOCATIONS OPERATIONS
// ============================================

export interface RouteWithLocations extends PrismaRoute {
  locations: (PrismaLocation & { deliverySchedule: DeliverySchedule[] })[]
}

/**
 * Get all routes for a specific region with their locations
 */
export async function getRoutesByRegion(region: string): Promise<RouteWithLocations[]> {
  return executeWithRetry(
    async () => {
      const routes = await prisma.route.findMany({
        where: {
          region,
          active: true,
        },
        include: {
          locations: {
            where: { active: true },
            include: {
              deliverySchedule: true,
            },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      })
      return routes
    },
    'getRoutesByRegion'
  )
}

/**
 * Get a single route by ID with locations
 */
export async function getRouteById(routeId: string): Promise<RouteWithLocations | null> {
  return executeWithRetry(
    async () => {
      const route = await prisma.route.findUnique({
        where: { id: routeId },
        include: {
          locations: {
            include: {
              deliverySchedule: true,
            },
            orderBy: { position: 'asc' },
          },
        },
      })
      return route
    },
    'getRouteById'
  )
}

/**
 * Create a new route
 * If a route with the same code exists but is inactive, it will be reactivated and updated
 */
export async function createRoute(data: {
  code: string
  name: string
  description?: string
  region: string
  active?: boolean
}): Promise<PrismaRoute> {
  return executeWithRetry(
    async () => {
      // Check if route with same code already exists
      const existingRoute = await prisma.route.findUnique({
        where: { code: data.code },
      })

      if (existingRoute) {
        // If the route exists but is inactive, reactivate and update it
        if (!existingRoute.active) {
          const reactivatedRoute = await prisma.route.update({
            where: { id: existingRoute.id },
            data: {
              name: data.name,
              description: data.description,
              region: data.region,
              active: data.active ?? true,
              updatedAt: new Date(),
            },
          })
          return reactivatedRoute
        }
        
        // If route is already active, throw error
        throw new DatabaseError(
          `Route code "${data.code}" already exists and is active. Please use a different code.`,
          'P2002'
        )
      }

      // Create new route if code doesn't exist
      const route = await prisma.route.create({
        data,
      })
      return route
    },
    'createRoute'
  )
}

/**
 * Update an existing route
 */
export async function updateRoute(
  routeId: string,
  data: {
    code?: string
    name?: string
    description?: string
    region?: string
    active?: boolean
  }
): Promise<PrismaRoute> {
  return executeWithRetry(
    async () => {
      // If updating code, check if it's already taken by another ACTIVE route
      if (data.code) {
        const existingRoute = await prisma.route.findUnique({
          where: { code: data.code },
        })

        if (existingRoute && existingRoute.id !== routeId && existingRoute.active) {
          throw new DatabaseError(
            `Route code "${data.code}" already exists and is active. Please use a different code.`,
            'P2002'
          )
        }
      }

      const route = await prisma.route.update({
        where: { id: routeId },
        data,
      })
      return route
    },
    'updateRoute'
  )
}

/**
 * Delete a route (soft delete by setting active to false)
 * Note: This allows the route code to be reused by creating a new route with the same code
 */
export async function deleteRoute(routeId: string): Promise<void> {
  return executeWithRetry(
    async () => {
      await prisma.route.update({
        where: { id: routeId },
        data: { active: false },
      })
    },
    'deleteRoute'
  )
}

/**
 * Create a new location for a route
 */
export async function createLocation(data: {
  routeId: string
  code: string
  name: string
  address?: string
  contact?: string
  notes?: string
  position?: number
  active?: boolean
}): Promise<PrismaLocation> {
  return executeWithRetry(
    async () => {
      const location = await prisma.location.create({
        data,
      })
      return location
    },
    'createLocation'
  )
}

/**
 * Update an existing location
 */
export async function updateLocation(
  locationId: string,
  data: {
    code?: string
    name?: string
    address?: string
    contact?: string
    notes?: string
    position?: number
    active?: boolean
  }
): Promise<PrismaLocation> {
  return executeWithRetry(
    async () => {
      const location = await prisma.location.update({
        where: { id: locationId },
        data,
      })
      return location
    },
    'updateLocation'
  )
}

/**
 * Delete a location (soft delete by setting active to false)
 */
export async function deleteLocation(locationId: string): Promise<void> {
  return executeWithRetry(
    async () => {
      await prisma.location.update({
        where: { id: locationId },
        data: { active: false },
      })
    },
    'deleteLocation'
  )
}

/**
 * Bulk create locations for a route
 */
export async function bulkCreateLocations(
  routeId: string,
  locations: Array<{
    code: string
    name: string
    address?: string
    contact?: string
    notes?: string
    position?: number
  }>
): Promise<void> {
  return executeWithRetry(
    async () => {
      await prisma.location.createMany({
        data: locations.map((loc, index) => ({
          routeId,
          ...loc,
          position: loc.position ?? index,
        })),
      })
    },
    'bulkCreateLocations'
  )
}

/**
 * Set delivery schedule for a location
 */
export async function setDeliverySchedule(
  locationId: string,
  daysOfWeek: number[]
): Promise<void> {
  return executeWithRetry(
    async () => {
      // Delete existing schedules
      await prisma.deliverySchedule.deleteMany({
        where: { locationId },
      })

      // Create new schedules
      if (daysOfWeek.length > 0) {
        await prisma.deliverySchedule.createMany({
          data: daysOfWeek.map(dayOfWeek => ({
            locationId,
            dayOfWeek,
          })),
        })
      }
    },
    'setDeliverySchedule'
  )
}

// ============================================
// GALLERY OPERATIONS
// ============================================

export interface GalleryRowWithImages extends GalleryRow {
  images: GalleryImage[]
}

/**
 * Get all gallery rows with images
 */
export async function getGalleryRows(): Promise<GalleryRowWithImages[]> {
  return executeWithRetry(
    async () => {
      const rows = await prisma.galleryRow.findMany({
        where: { active: true },
        include: {
          images: {
            where: { active: true },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      })
      return rows
    },
    'getGalleryRows'
  )
}

/**
 * Get a single gallery row by ID
 */
export async function getGalleryRowById(rowId: string): Promise<GalleryRowWithImages | null> {
  return executeWithRetry(
    async () => {
      const row = await prisma.galleryRow.findUnique({
        where: { id: rowId },
        include: {
          images: {
            orderBy: { position: 'asc' },
          },
        },
      })
      return row
    },
    'getGalleryRowById'
  )
}

/**
 * Create a new gallery row
 */
export async function createGalleryRow(data: {
  title: string
  position?: number
  active?: boolean
}): Promise<GalleryRow> {
  return executeWithRetry(
    async () => {
      const row = await prisma.galleryRow.create({
        data,
      })
      return row
    },
    'createGalleryRow'
  )
}

/**
 * Update a gallery row
 */
export async function updateGalleryRow(
  rowId: string,
  data: {
    title?: string
    position?: number
    active?: boolean
  }
): Promise<GalleryRow> {
  return executeWithRetry(
    async () => {
      const row = await prisma.galleryRow.update({
        where: { id: rowId },
        data,
      })
      return row
    },
    'updateGalleryRow'
  )
}

/**
 * Delete a gallery row
 */
export async function deleteGalleryRow(rowId: string): Promise<void> {
  return executeWithRetry(
    async () => {
      await prisma.galleryRow.update({
        where: { id: rowId },
        data: { active: false },
      })
    },
    'deleteGalleryRow'
  )
}

/**
 * Create a new gallery image
 */
export async function createGalleryImage(data: {
  rowId: string
  url: string
  title: string
  subtitle?: string
  position?: number
  active?: boolean
}): Promise<GalleryImage> {
  return executeWithRetry(
    async () => {
      const image = await prisma.galleryImage.create({
        data,
      })
      return image
    },
    'createGalleryImage'
  )
}

/**
 * Update a gallery image
 */
export async function updateGalleryImage(
  imageId: string,
  data: {
    url?: string
    title?: string
    subtitle?: string
    position?: number
    active?: boolean
  }
): Promise<GalleryImage> {
  return executeWithRetry(
    async () => {
      const image = await prisma.galleryImage.update({
        where: { id: imageId },
        data,
      })
      return image
    },
    'updateGalleryImage'
  )
}

/**
 * Delete a gallery image
 */
export async function deleteGalleryImage(imageId: string): Promise<void> {
  return executeWithRetry(
    async () => {
      await prisma.galleryImage.update({
        where: { id: imageId },
        data: { active: false },
      })
    },
    'deleteGalleryImage'
  )
}

/**
 * Bulk create images for a gallery row
 */
export async function bulkCreateGalleryImages(
  rowId: string,
  images: Array<{
    url: string
    title: string
    subtitle?: string
    position?: number
  }>
): Promise<void> {
  return executeWithRetry(
    async () => {
      await prisma.galleryImage.createMany({
        data: images.map((img, index) => ({
          rowId,
          ...img,
          position: img.position ?? index,
        })),
      })
    },
    'bulkCreateGalleryImages'
  )
}

/**
 * Reorder gallery rows
 */
export async function reorderGalleryRows(rowIds: string[]): Promise<void> {
  return executeWithRetry(
    async () => {
      const updates = rowIds.map((id, index) =>
        prisma.galleryRow.update({
          where: { id },
          data: { position: index },
        })
      )
      await prisma.$transaction(updates)
    },
    'reorderGalleryRows'
  )
}

/**
 * Reorder images within a gallery row
 */
export async function reorderGalleryImages(imageIds: string[]): Promise<void> {
  return executeWithRetry(
    async () => {
      const updates = imageIds.map((id, index) =>
        prisma.galleryImage.update({
          where: { id },
          data: { position: index },
        })
      )
      await prisma.$transaction(updates)
    },
    'reorderGalleryImages'
  )
}
