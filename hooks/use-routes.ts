'use client'

import { useState, useEffect } from 'react'
import type { Route } from '@/app/kuala-lumpur/data'
import { loadRoutesFromAPI, saveRoutesToAPI, initializeDatabaseAPI } from '@/lib/api-client'

export function useRoutes(region: string, initialData: Route[]) {
  const [routes, setRoutes] = useState<Route[]>(initialData)
  const [originalRoutes, setOriginalRoutes] = useState<Route[]>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data from centralized database on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Try to load from centralized database via API
        const loadedRoutes = await loadRoutesFromAPI(region)
        
        // If database is empty, initialize with seed data
        if (loadedRoutes.length === 0) {
          await initializeDatabaseAPI(region, initialData)
          setRoutes(initialData)
          setOriginalRoutes(initialData)
        } else {
          setRoutes(loadedRoutes)
          setOriginalRoutes(loadedRoutes)
        }
      } catch (err) {
        console.error('Error loading routes from database:', err)
        setError('Failed to load data from server. Using local data.')
        // Fall back to initial data if API fails
        setRoutes(initialData)
        setOriginalRoutes(initialData)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [region]) // Only depend on region, not initialData to avoid re-fetching

  // Save data to centralized database
  const saveData = async () => {
    try {
      setIsSaving(true)
      setError(null)
      
      await saveRoutesToAPI(routes, region)
      setOriginalRoutes(routes) // Update original routes after successful save
      
      return true
    } catch (err) {
      console.error('Error saving routes to database:', err)
      setError('Failed to save data to server. Please try again.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(routes) !== JSON.stringify(originalRoutes)

  // Discard changes and revert to original
  const discardChanges = () => {
    setRoutes(originalRoutes)
  }

  return {
    routes,
    setRoutes,
    originalRoutes,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    saveData,
    discardChanges,
  }
}
