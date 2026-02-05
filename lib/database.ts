import type { Route, Location, DeliveryMode } from '@/app/kuala-lumpur/data'

const STORAGE_PREFIX = 'delivery_routes_'

/**
 * Load all routes for a specific region from localStorage
 */
export async function loadRoutes(region: string): Promise<Route[]> {
  try {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${region}`)
    if (!stored) return []
    
    const routes = JSON.parse(stored)
    // Convert date strings back to Date objects
    return routes.map((route: any) => ({
      ...route,
      lastUpdateTime: new Date(route.lastUpdateTime),
    }))
  } catch (error) {
    console.error('Error loading routes:', error)
    return []
  }
}

/**
 * Save a single route to localStorage
 */
export async function saveRoute(route: Route, region: string): Promise<Route> {
  try {
    const routes = await loadRoutes(region)
    const index = routes.findIndex(r => r.id === route.id)
    
    if (index >= 0) {
      routes[index] = route
    } else {
      routes.push(route)
    }
    
    localStorage.setItem(`${STORAGE_PREFIX}${region}`, JSON.stringify(routes))
    return route
  } catch (error) {
    console.error('Error saving route:', error)
    throw error
  }
}

/**
 * Save multiple routes at once (bulk save)
 */
export async function saveRoutes(routes: Route[], region: string): Promise<Route[]> {
  try {
    if (typeof window === 'undefined') return routes
    
    localStorage.setItem(`${STORAGE_PREFIX}${region}`, JSON.stringify(routes))
    return routes
  } catch (error) {
    console.error('Error saving routes:', error)
    throw error
  }
}

/**
 * Delete a route and all its locations
 */
export async function deleteRoute(routeId: string, region: string): Promise<void> {
  try {
    const routes = await loadRoutes(region)
    const filtered = routes.filter(r => r.id !== routeId)
    await saveRoutes(filtered, region)
  } catch (error) {
    console.error('Error deleting route:', error)
    throw error
  }
}

/**
 * Update a single location
 */
export async function updateLocation(location: Location, routeId: string, region: string): Promise<Location> {
  try {
    const routes = await loadRoutes(region)
    const route = routes.find(r => r.id === routeId)
    
    if (!route) throw new Error('Route not found')
    
    const locIndex = route.locations.findIndex(l => l.id === location.id)
    if (locIndex >= 0) {
      route.locations[locIndex] = location
    } else {
      route.locations.push(location)
    }
    
    await saveRoute(route, region)
    return location
  } catch (error) {
    console.error('Error updating location:', error)
    throw error
  }
}

/**
 * Delete a location
 */
export async function deleteLocation(locationId: string, routeId: string, region: string): Promise<void> {
  try {
    const routes = await loadRoutes(region)
    const route = routes.find(r => r.id === routeId)
    
    if (!route) throw new Error('Route not found')
    
    route.locations = route.locations.filter(l => l.id !== locationId)
    await saveRoute(route, region)
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
}

/**
 * Initialize database with seed data if empty
 */
export async function initializeDatabase(region: string, seedData: Route[]): Promise<void> {
  try {
    const existing = await loadRoutes(region)
    if (existing.length === 0) {
      await saveRoutes(seedData, region)
      console.log(`Initialized ${region} with ${seedData.length} routes`)
    }
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
