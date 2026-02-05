'use client'

import { useState, useEffect } from 'react'
import type { Route } from '@/app/kuala-lumpur/data'
import { loadRoutes, saveRoutes, initializeDatabase } from '@/lib/database'

export function useRoutes(region: string, initialData: Route[]) {
  const [routes, setRoutes] = useState<Route[]>(initialData)
  const [originalRoutes, setOriginalRoutes] = useState<Route[]>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data from database on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Try to load from database
        const loadedRoutes = await loadRoutes(region)
        
        // If database is empty, initialize with seed data
        if (loadedRoutes.length === 0) {
          await initializeDatabase(region, initialData)
          setRoutes(initialData)
          setOriginalRoutes(initialData)
        } else {
          setRoutes(loadedRoutes)
          setOriginalRoutes(loadedRoutes)
        }
      } catch (err) {
        console.error('Error loading routes:', err)
        setError('Failed to load data. Using local data.')
        // Fall back to initial data if database fails
        setRoutes(initialData)
        setOriginalRoutes(initialData)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [region, initialData]) // Reload if region or initialData changes

  // Save data to database
  const saveData = async () => {
    try {
      setIsSaving(true)
      setError(null)
      
      await saveRoutes(routes, region)
      setOriginalRoutes(routes) // Update original routes after successful save
      
      return true
    } catch (err) {
      console.error('Error saving routes:', err)
      setError('Failed to save data. Please try again.')
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
