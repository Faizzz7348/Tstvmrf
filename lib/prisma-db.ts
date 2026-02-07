import { prisma } from './prisma'
import type { Route as PrismaRoute, Location as PrismaLocation, DeliverySchedule, GalleryRow, GalleryImage } from '@prisma/client'

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
  try {
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
  } catch (error) {
    console.error('Error fetching routes:', error)
    throw error
  }
}

/**
 * Get a single route by ID with locations
 */
export async function getRouteById(routeId: string): Promise<RouteWithLocations | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching route:', error)
    throw error
  }
}

/**
 * Create a new route
 */
export async function createRoute(data: {
  code: string
  name: string
  description?: string
  region: string
  active?: boolean
}): Promise<PrismaRoute> {
  try {
    const route = await prisma.route.create({
      data,
    })
    return route
  } catch (error) {
    console.error('Error creating route:', error)
    throw error
  }
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
  try {
    const route = await prisma.route.update({
      where: { id: routeId },
      data,
    })
    return route
  } catch (error) {
    console.error('Error updating route:', error)
    throw error
  }
}

/**
 * Delete a route (soft delete by setting active to false)
 */
export async function deleteRoute(routeId: string): Promise<void> {
  try {
    await prisma.route.update({
      where: { id: routeId },
      data: { active: false },
    })
  } catch (error) {
    console.error('Error deleting route:', error)
    throw error
  }
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
  try {
    const location = await prisma.location.create({
      data,
    })
    return location
  } catch (error) {
    console.error('Error creating location:', error)
    throw error
  }
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
  try {
    const location = await prisma.location.update({
      where: { id: locationId },
      data,
    })
    return location
  } catch (error) {
    console.error('Error updating location:', error)
    throw error
  }
}

/**
 * Delete a location (soft delete by setting active to false)
 */
export async function deleteLocation(locationId: string): Promise<void> {
  try {
    await prisma.location.update({
      where: { id: locationId },
      data: { active: false },
    })
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
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
  try {
    await prisma.location.createMany({
      data: locations.map((loc, index) => ({
        routeId,
        ...loc,
        position: loc.position ?? index,
      })),
    })
  } catch (error) {
    console.error('Error bulk creating locations:', error)
    throw error
  }
}

/**
 * Set delivery schedule for a location
 */
export async function setDeliverySchedule(
  locationId: string,
  daysOfWeek: number[]
): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Error setting delivery schedule:', error)
    throw error
  }
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
  try {
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
  } catch (error) {
    console.error('Error fetching gallery rows:', error)
    throw error
  }
}

/**
 * Get a single gallery row by ID
 */
export async function getGalleryRowById(rowId: string): Promise<GalleryRowWithImages | null> {
  try {
    const row = await prisma.galleryRow.findUnique({
      where: { id: rowId },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
      },
    })
    return row
  } catch (error) {
    console.error('Error fetching gallery row:', error)
    throw error
  }
}

/**
 * Create a new gallery row
 */
export async function createGalleryRow(data: {
  title: string
  position?: number
  active?: boolean
}): Promise<GalleryRow> {
  try {
    const row = await prisma.galleryRow.create({
      data,
    })
    return row
  } catch (error) {
    console.error('Error creating gallery row:', error)
    throw error
  }
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
  try {
    const row = await prisma.galleryRow.update({
      where: { id: rowId },
      data,
    })
    return row
  } catch (error) {
    console.error('Error updating gallery row:', error)
    throw error
  }
}

/**
 * Delete a gallery row
 */
export async function deleteGalleryRow(rowId: string): Promise<void> {
  try {
    await prisma.galleryRow.update({
      where: { id: rowId },
      data: { active: false },
    })
  } catch (error) {
    console.error('Error deleting gallery row:', error)
    throw error
  }
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
  try {
    const image = await prisma.galleryImage.create({
      data,
    })
    return image
  } catch (error) {
    console.error('Error creating gallery image:', error)
    throw error
  }
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
  try {
    const image = await prisma.galleryImage.update({
      where: { id: imageId },
      data,
    })
    return image
  } catch (error) {
    console.error('Error updating gallery image:', error)
    throw error
  }
}

/**
 * Delete a gallery image
 */
export async function deleteGalleryImage(imageId: string): Promise<void> {
  try {
    await prisma.galleryImage.update({
      where: { id: imageId },
      data: { active: false },
    })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    throw error
  }
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
  try {
    await prisma.galleryImage.createMany({
      data: images.map((img, index) => ({
        rowId,
        ...img,
        position: img.position ?? index,
      })),
    })
  } catch (error) {
    console.error('Error bulk creating gallery images:', error)
    throw error
  }
}

/**
 * Reorder gallery rows
 */
export async function reorderGalleryRows(rowIds: string[]): Promise<void> {
  try {
    const updates = rowIds.map((id, index) =>
      prisma.galleryRow.update({
        where: { id },
        data: { position: index },
      })
    )
    await prisma.$transaction(updates)
  } catch (error) {
    console.error('Error reordering gallery rows:', error)
    throw error
  }
}

/**
 * Reorder images within a gallery row
 */
export async function reorderGalleryImages(imageIds: string[]): Promise<void> {
  try {
    const updates = imageIds.map((id, index) =>
      prisma.galleryImage.update({
        where: { id },
        data: { position: index },
      })
    )
    await prisma.$transaction(updates)
  } catch (error) {
    console.error('Error reordering gallery images:', error)
    throw error
  }
}
