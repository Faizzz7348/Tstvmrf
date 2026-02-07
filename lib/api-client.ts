/**
 * API Client for server-side database operations
 * This replaces localStorage with centralized database calls
 */

import type { Route } from '@/app/kuala-lumpur/data'
import type { RouteWithLocations } from './prisma-db'

/**
 * Convert Prisma route format to app route format
 */
function convertPrismaRouteToAppRoute(prismaRoute: RouteWithLocations): Route {
  // Determine delivery mode based on delivery schedule
  const getDeliveryMode = (schedules: any[]) => {
    if (!schedules || schedules.length === 0) return 'Daily'
    const days = schedules.map(s => s.dayOfWeek)
    if (days.length === 7) return 'Daily'
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekday'
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekend'
    return 'Daily'
  }

  // Ensure date is a Date object (API returns strings)
  const lastUpdateTime = typeof prismaRoute.updatedAt === 'string' 
    ? new Date(prismaRoute.updatedAt) 
    : prismaRoute.updatedAt

  return {
    id: prismaRoute.id,
    code: prismaRoute.code,
    location: prismaRoute.name, // Map Prisma 'name' to app 'location'
    delivery: 'Daily', // Default delivery for the route
    shift: 'AM', // Default shift
    lastUpdateTime: lastUpdateTime,
    locations: prismaRoute.locations.map((loc, index) => ({
      id: loc.id,
      no: index + 1,
      code: loc.code,
      location: loc.name, // Map Prisma 'name' to app 'location'
      delivery: getDeliveryMode(loc.deliverySchedule || []),
      lat: loc.address || '', // Temporarily use address field for lat
      lng: loc.contact || '', // Temporarily use contact field for lng
    })),
  }
}

/**
 * Load all routes for a specific region from the database
 */
export async function loadRoutesFromAPI(region: string): Promise<Route[]> {
  try {
    const response = await fetch(`/api/routes?region=${encodeURIComponent(region)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch routes: ${response.statusText}`)
    }

    const prismaRoutes: RouteWithLocations[] = await response.json()
    return prismaRoutes.map(convertPrismaRouteToAppRoute)
  } catch (error) {
    console.error('Error loading routes from API:', error)
    throw error
  }
}

/**
 * Save a single route to the database
 */
export async function saveRouteToAPI(route: Route, region: string): Promise<Route> {
  try {
    // Check if route exists (has locations in database)
    const existingResponse = await fetch(`/api/routes?region=${encodeURIComponent(region)}`)
    const existingRoutes: RouteWithLocations[] = await existingResponse.json()
    const existingRoute = existingRoutes.find(r => r.code === route.code)

    if (existingRoute) {
      // Update existing route
      const response = await fetch('/api/routes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: existingRoute.id,
          code: route.code,
          name: route.location, // Map app 'location' to Prisma 'name'
          region,
          active: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update route: ${response.statusText}`)
      }

      // Update locations
      await syncLocationsToAPI(route, existingRoute.id)
    } else {
      // Create new route
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: route.code,
          name: route.location, // Map app 'location' to Prisma 'name'
          description: '',
          region,
          active: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create route: ${response.statusText}`)
      }

      const newRoute: RouteWithLocations = await response.json()
      
      // Create locations
      await syncLocationsToAPI(route, newRoute.id)
    }

    return route
  } catch (error) {
    console.error('Error saving route to API:', error)
    throw error
  }
}

/**
 * Sync locations for a route
 */
async function syncLocationsToAPI(route: Route, routeId: string): Promise<void> {
  // For simplicity, we'll create/update locations
  // A more sophisticated approach would diff the changes
  
  for (const location of route.locations) {
    try {
      // Try to update first (locations might exist)
      const updateResponse = await fetch('/api/locations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: location.id,
          code: location.code,
          name: location.location,
          address: '',
          contact: '',
          notes: '',
          position: route.locations.indexOf(location),
          active: true,
        }),
      })

      // If update fails, try to create
      if (!updateResponse.ok) {
        await fetch('/api/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            routeId,
            code: location.code,
            name: location.location,
            address: '',
            contact: '',
            notes: '',
            position: route.locations.indexOf(location),
            active: true,
          }),
        })
      }
    } catch (error) {
      console.error(`Error syncing location ${location.code}:`, error)
      // Continue with other locations
    }
  }
}

/**
 * Save multiple routes at once to the database
 */
export async function saveRoutesToAPI(routes: Route[], region: string): Promise<Route[]> {
  try {
    // Save each route sequentially to maintain data integrity
    for (const route of routes) {
      await saveRouteToAPI(route, region)
    }
    return routes
  } catch (error) {
    console.error('Error saving routes to API:', error)
    throw error
  }
}

/**
 * Delete a route from the database
 */
export async function deleteRouteFromAPI(routeId: string): Promise<void> {
  try {
    const response = await fetch(`/api/routes?id=${encodeURIComponent(routeId)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete route: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting route from API:', error)
    throw error
  }
}

/**
 * Initialize database with seed data if empty
 */
export async function initializeDatabaseAPI(region: string, seedData: Route[]): Promise<void> {
  try {
    const existingRoutes = await loadRoutesFromAPI(region)
    
    // Only initialize if database is empty
    if (existingRoutes.length === 0) {
      await saveRoutesToAPI(seedData, region)
    }
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
