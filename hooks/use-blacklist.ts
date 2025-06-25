import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'

interface UseBlacklistOptions {
  onSuccess?: (propertyId: number) => void
}

export function useBlacklist(options: UseBlacklistOptions = {}) {
  const [blacklistedProperties, setBlacklistedProperties] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState<Set<number>>(new Set())

  const blacklistProperty = useCallback(async (propertyId: number) => {
    // Optimistic update
    setBlacklistedProperties(prev => new Set(prev).add(propertyId))
    setLoading(prev => new Set(prev).add(propertyId))

    try {
      const response = await fetch(`/api/properties/${propertyId}/blacklist`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to remove property')
      }

      const data = await response.json()
      
      toast({
        title: "Property Removed",
        description: "Property has been successfully removed from listings.",
        duration: 3000,
      })

      options.onSuccess?.(propertyId)
      
    } catch (error) {
      // Revert optimistic update on error
      setBlacklistedProperties(prev => {
        const newSet = new Set(prev)
        newSet.delete(propertyId)
        return newSet
      })
      
      toast({
        title: "Error",
        description: "Failed to remove property. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
      
      console.error('Error blacklisting property:', error)
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(propertyId)
        return newSet
      })
    }
  }, [options])

  return {
    blacklistProperty,
    isBlacklisted: (propertyId: number) => blacklistedProperties.has(propertyId),
    isLoading: (propertyId: number) => loading.has(propertyId),
  }
} 