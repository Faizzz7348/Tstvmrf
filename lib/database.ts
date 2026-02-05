import { createClient } from '@/lib/supabase-browser'
import type { Route, Location, DeliveryMode } from '@/app/kuala-lumpur/data'

export interface DbRoute {
  id: string
  code: string
  location: string
  delivery: string
  shift: 'AM' | 'PM'
  region: string
  delivery_mode?: DeliveryMode
  last_update_time: string
  created_at: string
  updated_at: string
}

export interface DbLocation {
  id: string
  route_id: string
  no: number
  code: string
  location: string
  delivery: string
  delivery_mode?: DeliveryMode
  lat?: string
  lng?: string
  created_at: string
  updated_at: string
}

/**
 * Load all routes for a specific region with their locations
 */
export async function loadRoutes(region: string): Promise<Route[]> {
  const supabase = createClient()
  
  try {
    // Fetch routes
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .eq('region', region)
      .order('created_at', { ascending: true })

    if (routesError) throw routesError

    if (!routesData || routesData.length === 0) {
      return []
    }

    // Fetch all locations for these routes
    const routeIds = routesData.map((r: DbRoute) => r.id)
    const { data: locationsData, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .in('route_id', routeIds)
      .order('no', { ascending: true })

    if (locationsError) throw locationsError

    // Map database data to Route format
    const routes: Route[] = routesData.map((route: DbRoute) => ({
      id: route.id,
      code: route.code,
      location: route.location,
      delivery: route.delivery,
      shift: route.shift,
      lastUpdateTime: new Date(route.last_update_time),
      deliveryMode: route.delivery_mode,
      locations: (locationsData as DbLocation[] || [])
        .filter((loc: DbLocation) => loc.route_id === route.id)
        .map((loc: DbLocation) => ({
          id: loc.id,
          no: loc.no,
          code: loc.code,
          location: loc.location,
          delivery: loc.delivery,
          deliveryMode: loc.delivery_mode,
          lat: loc.lat,
          lng: loc.lng,
        }))
    }))

    return routes
  } catch (error) {
    console.error('Error loading routes:', error)
    throw error
  }
}

/**
 * Save a single route to the database
 */
export async function saveRoute(route: Route, region: string): Promise<Route> {
  const supabase = createClient()
  
  try {
    // Upsert route
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .upsert({
        id: route.id,
        code: route.code,
        location: route.location,
        delivery: route.delivery,
        shift: route.shift,
        region: region,
        delivery_mode: route.deliveryMode,
        last_update_time: route.lastUpdateTime.toISOString(),
      })
      .select()
      .single()

    if (routeError) throw routeError

    // Delete existing locations for this route
    await supabase
      .from('locations')
      .delete()
      .eq('route_id', route.id)

    // Insert new locations if any
    if (route.locations && route.locations.length > 0) {
      const { error: locationsError } = await supabase
        .from('locations')
        .insert(
          route.locations.map(loc => ({
            id: loc.id,
            route_id: route.id,
            no: loc.no,
            code: loc.code,
            location: loc.location,
            delivery: loc.delivery,
            delivery_mode: loc.deliveryMode,
            lat: loc.lat,
            lng: loc.lng,
          }))
        )

      if (locationsError) throw locationsError
    }

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
  const supabase = createClient()
  
  try {
    // Save routes one by one to ensure locations are properly handled
    const savedRoutes: Route[] = []
    for (const route of routes) {
      const saved = await saveRoute(route, region)
      savedRoutes.push(saved)
    }
    
    return savedRoutes
  } catch (error) {
    console.error('Error saving routes:', error)
    throw error
  }
}

/**
 * Delete a route and all its locations
 */
export async function deleteRoute(routeId: string): Promise<void> {
  const supabase = createClient()
  
  try {
    // Locations will be automatically deleted due to CASCADE
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', routeId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting route:', error)
    throw error
  }
}

/**
 * Update a single location
 */
export async function updateLocation(location: Location, routeId: string): Promise<Location> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('locations')
      .upsert({
        id: location.id,
        route_id: routeId,
        no: location.no,
        code: location.code,
        location: location.location,
        delivery: location.delivery,
        delivery_mode: location.deliveryMode,
        lat: location.lat,
        lng: location.lng,
      })
      .select()
      .single()

    if (error) throw error
    
    return location
  } catch (error) {
    console.error('Error updating location:', error)
    throw error
  }
}

/**
 * Delete a location
 */
export async function deleteLocation(locationId: string): Promise<void> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
}

/**
 * Initialize database with seed data if empty
 */
export async function initializeDatabase(region: string, seedData: Route[]): Promise<void> {
  const supabase = createClient()
  
  try {
    // Check if region has any routes
    const { count, error: countError } = await supabase
      .from('routes')
      .select('*', { count: 'exact', head: true })
      .eq('region', region)

    if (countError) throw countError

    // Only seed if empty
    if (count === 0) {
      await saveRoutes(seedData, region)
      console.log(`Initialized ${region} with ${seedData.length} routes`)
    }
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
