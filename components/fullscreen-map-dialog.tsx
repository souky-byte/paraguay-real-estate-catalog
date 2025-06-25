"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import type { Property } from "@/lib/database"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  X, 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Search, 
  Filter,
  Loader2,
  RotateCcw
} from "lucide-react"
import { BlacklistButton } from "@/components/ui/blacklist-button"
import { useBlacklist } from "@/hooks/use-blacklist"

interface FullscreenMapDialogProps {
  isOpen: boolean
  onClose: () => void
  onPropertySelect: (property: Property) => void
  filters: any
}

interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// Deal categories (same as in PropertyMap)
const DEAL_CATEGORIES = [
  {
    id: "excellent",
    name: "Excellent",
    description: "-20%+ below market",
    color: "#10b981",
    bgColor: "bg-emerald-500",
    hoverBg: "hover:bg-emerald-600",
    textColor: "text-emerald-900",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "🔥",
    range: (diff: number) => diff < -20,
  },
  {
    id: "good",
    name: "Good Deal",
    description: "-10% to -20%",
    color: "#22c55e",
    bgColor: "bg-green-500",
    hoverBg: "hover:bg-green-600",
    textColor: "text-green-900",
    bgLight: "bg-green-50",
    borderColor: "border-green-200",
    icon: "💰",
    range: (diff: number) => diff >= -20 && diff < -10,
  },
  {
    id: "below",
    name: "Below Market",
    description: "0% to -10%",
    color: "#84cc16",
    bgColor: "bg-lime-500",
    hoverBg: "hover:bg-lime-600",
    textColor: "text-lime-900",
    bgLight: "bg-lime-50",
    borderColor: "border-lime-200",
    icon: "📈",
    range: (diff: number) => diff >= -10 && diff < 0,
  },
  {
    id: "fair",
    name: "Fair Price",
    description: "0% to +10%",
    color: "#eab308",
    bgColor: "bg-yellow-500",
    hoverBg: "hover:bg-yellow-600",
    textColor: "text-yellow-900",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: "⚖️",
    range: (diff: number) => diff >= 0 && diff < 10,
  },
  {
    id: "above",
    name: "Above Market",
    description: "+10% and above",
    color: "#ef4444",
    bgColor: "bg-red-500",
    hoverBg: "hover:bg-red-600",
    textColor: "text-red-900",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    icon: "📊",
    range: (diff: number) => diff >= 10,
  },
]

// Dynamically import the map component with bounds callback
// @ts-ignore: ignore module resolution for dynamic import
const MapComponent = dynamic(
  () => import("@/components/fullscreen-map-client"),
  {
    loading: () => (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-emerald-600" />
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
) as any

export function FullscreenMapDialog({ isOpen, onClose, onPropertySelect, filters }: FullscreenMapDialogProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeLegendFilters, setActiveLegendFilters] = useState<string[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Blacklist hook
  const { blacklistProperty, isBlacklisted, isLoading: isBlacklistLoading } = useBlacklist({
    onSuccess: (propertyId) => {
      console.log(`Property ${propertyId} blacklisted successfully`)
      // Optionally remove from visible properties
      setVisibleProperties(prev => prev.filter(p => p.id !== propertyId))
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    }
  })

  // Fetch properties for map
  useEffect(() => {
    if (!isOpen) return

    const fetchMapProperties = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "" && value !== "all" && value !== "any") {
            params.append(key, String(value))
          }
        })

        const response = await fetch(`/api/properties/map?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setProperties(data)
        } else {
          console.error("API returned non-array data:", data)
          setProperties([])
          setError("Invalid data format received from server")
        }
      } catch (error) {
        console.error("Error fetching map properties:", error)
        setProperties([])
        setError(error instanceof Error ? error.message : "Failed to fetch properties")
      } finally {
        setLoading(false)
      }
    }

    fetchMapProperties()
  }, [filters, isOpen])

  // Update visible properties when map bounds change
  const updateVisibleProperties = useCallback(() => {
    if (!mapBounds || !properties.length) {
      setVisibleProperties(properties)
      return
    }

    const propertiesInBounds = properties.filter((property) => {
      if (!property.latitude || !property.longitude) return false

      return (
        property.latitude >= mapBounds.south &&
        property.latitude <= mapBounds.north &&
        property.longitude >= mapBounds.west &&
        property.longitude <= mapBounds.east
      )
    })

    setVisibleProperties(propertiesInBounds)
  }, [properties, mapBounds])

  useEffect(() => {
    updateVisibleProperties()
  }, [updateVisibleProperties])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Get category for property
  const getPropertyCategory = (diffPercent: number) => {
    return DEAL_CATEGORIES.find((cat) => cat.range(diffPercent))?.id || "fair"
  }

  // Filter visible properties based on active legend filters
  const filteredVisibleProperties = useMemo(() => {
    return activeLegendFilters.length > 0
      ? visibleProperties.filter((property) => {
          const category = getPropertyCategory(property.price_per_sqm_diff_percent)
          return activeLegendFilters.includes(category)
        })
      : visibleProperties
  }, [visibleProperties, activeLegendFilters])

  // Toggle legend filter
  const toggleLegendFilter = (categoryId: string) => {
    setActiveLegendFilters((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  // Clear all legend filters
  const clearLegendFilters = () => {
    setActiveLegendFilters([])
  }

  // Count visible properties by category
  const getCategoryCount = (categoryId: string) => {
    return visibleProperties.filter((property) => {
      const category = getPropertyCategory(property.price_per_sqm_diff_percent)
      return category === categoryId
    }).length
  }

  // Format price helper
  const formatPrice = (price: number, currency: string) => {
    if (currency === "Gs." || currency === "PYG") {
      if (price >= 1000000000) {
        return `${currency} ${(price / 1000000000).toFixed(1)}B`
      } else if (price >= 1000000) {
        return `${currency} ${(price / 1000000).toFixed(1)}M`
      }
      return `${currency} ${price.toLocaleString()}`
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`
    }
    return `$${price.toLocaleString()}`
  }

  const formatArea = (m2: number) => {
    return `${m2.toLocaleString("en-US")} m²`
  }

  // Handle property selection from map
  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    onPropertySelect(property)
  }

  // Handle property hover with debounce
  const handlePropertyHover = useCallback((propertyId: string | null) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    if (propertyId) {
      // Immediate highlight on enter
      setHoveredPropertyId(propertyId)
    } else {
      // Debounced clear on leave
      const timeout = setTimeout(() => {
        setHoveredPropertyId(null)
        debounceTimeoutRef.current = null
      }, 150) // 150ms delay
      debounceTimeoutRef.current = timeout
    }
  }, [])

  // Handle map bounds change
  const handleMapBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
  }, [])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0 !flex !flex-col">
        <div className="flex h-full">
          {/* Left Panel - Properties List (50% width) */}
          <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col min-h-0">
            {/* Minimalist Header */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-gray-900">
                    {filteredVisibleProperties.length} Properties
                  </h2>
                  <span className="text-xs text-gray-500">
                    of {properties.length}
                  </span>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Compact Multiselect Filter */}
            <div className="p-3 border-b border-gray-100">
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700 mb-2">Filter by Deal Type</div>
                <div className="flex flex-wrap gap-1.5">
                  {DEAL_CATEGORIES.map((category) => {
                    const count = getCategoryCount(category.id)
                    const isActive = activeLegendFilters.includes(category.id)
                    const isDisabled = count === 0

                    return (
                      <button
                        key={category.id}
                        onClick={() => !isDisabled && toggleLegendFilter(category.id)}
                        disabled={isDisabled}
                        className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium
                          transition-all duration-200 border
                          ${isActive 
                            ? `${category.bgColor} text-white border-transparent shadow-sm` 
                            : isDisabled
                              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }
                        `}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-white" : category.bgColor
                          }`}
                        />
                        <span>{category.name}</span>
                        <span className={`
                          ${isActive ? "text-white/80" : "text-gray-500"}
                        `}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {activeLegendFilters.length > 0 && (
                  <button
                    onClick={clearLegendFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Properties List - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-3">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <p className="text-sm text-gray-600">Loading properties...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                ) : filteredVisibleProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No properties in this area</h3>
                    <p className="text-sm text-gray-600">Try zooming out or moving the map to see more properties.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredVisibleProperties.map((property) => {
                      const category = DEAL_CATEGORIES.find((cat) => cat.range(property.price_per_sqm_diff_percent))
                      const isSelected = selectedProperty?.id === property.id

                      return (
                        <div 
                          key={property.id} 
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group rounded-xl overflow-hidden bg-white ${
                            isSelected ? "ring-2 ring-black" : ""
                          }`}
                          onClick={() => handlePropertySelect(property)}
                          onMouseEnter={() => handlePropertyHover(String(property.id))}
                          onMouseLeave={() => handlePropertyHover(null)}
                        >
                          {/* Image Container */}
                          <div className="relative">
                            <div className="aspect-square relative">
                              <Image 
                                src={property.image_urls?.[0] || "/placeholder.svg"} 
                                alt={property.title}
                                fill
                                className="object-cover"
                              />
                              
                              {/* Heart icon */}
                              <div className="absolute top-2 right-2">
                                <button className="p-1 hover:scale-110 transition-transform">
                                  <svg 
                                    className="w-5 h-5 text-white/90 hover:text-red-500 transition-colors drop-shadow-lg" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </div>

                              {/* Hot Deal Badge */}
                              {property.price_per_sqm_diff_percent < -20 && (
                                <div className="absolute top-2 left-2">
                                  <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                    HOT
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3">
                            {/* Location and Rating */}
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {property.address?.split(',')[0] || property.address || 'No address'}
                                </div>
                              </div>
                            </div>

                            {/* Distance/Zone */}
                            <div className="text-xs text-gray-500 mb-2">
                              {property.zone}
                            </div>

                            {/* Area */}
                            <div className="text-xs text-gray-500 mb-2">
                              {formatArea(property.m2)}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatPrice(property.price, property.currency)}
                              </span>
                              <span className="text-xs text-gray-600">total</span>
                            </div>

                            {/* Deal badge and Actions */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex-1">
                                {category && property.price_per_sqm_diff_percent < -10 && (
                                  <div className={`inline-block text-xs font-medium px-2 py-1 rounded ${category.bgColor} text-white`}>
                                    {Math.abs(property.price_per_sqm_diff_percent)}% {category.name}
                                  </div>
                                )}
                              </div>
                              
                              {/* Blacklist Button */}
                              <div className="flex-shrink-0 ml-2">
                                <BlacklistButton
                                  propertyId={property.id}
                                  onBlacklist={blacklistProperty}
                                  isLoading={isBlacklistLoading(property.id)}
                                  isBlacklisted={isBlacklisted(property.id)}
                                  size="sm"
                                  variant="ghost"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                                  )}
                </div>
              </div>
          </div>

          {/* Right Panel - Map (50% width) */}
          <div className="w-1/2 relative">
            {/* @ts-ignore */}
            <MapComponent 
              properties={properties} 
              onPropertySelect={handlePropertySelect}
              onBoundsChange={handleMapBoundsChange}
              dealCategories={DEAL_CATEGORIES}
              hoveredPropertyId={hoveredPropertyId}
              activeLegendFilters={activeLegendFilters}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
