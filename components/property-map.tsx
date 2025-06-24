"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import type { Property } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Zap, Loader2, RotateCcw } from "lucide-react"

interface PropertyMapProps {
  onPropertySelect: (property: Property) => void
  filters: any
}

// Deal categories
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

// Dynamically import the map component
const MapComponent = dynamic(() => import("./property-map-client"), {
  loading: () => (
    <Card className="h-[700px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-emerald-600" />
        <p className="text-gray-600 font-medium">Loading interactive map...</p>
        <p className="text-gray-500 text-sm mt-2">Preparing your land plot visualization</p>
      </div>
    </Card>
  ),
  ssr: false,
})

export function PropertyMap({ onPropertySelect, filters }: PropertyMapProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLegendFilters, setActiveLegendFilters] = useState<string[]>([])

  // Fetch properties for map
  useEffect(() => {
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
  }, [filters])

  // Get category for property
  const getPropertyCategory = (diffPercent: number) => {
    return DEAL_CATEGORIES.find((cat) => cat.range(diffPercent))?.id || "fair"
  }

  // Filter properties based on active legend filters
  const filteredProperties = useMemo(() => {
    return activeLegendFilters.length > 0
      ? properties.filter((property) => {
          const category = getPropertyCategory(property.price_per_sqm_diff_percent)
          return activeLegendFilters.includes(category)
        })
      : properties
  }, [properties, activeLegendFilters])

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

  // Count properties by category
  const getCategoryCount = (categoryId: string) => {
    return properties.filter((property) => {
      const category = getPropertyCategory(property.price_per_sqm_diff_percent)
      return category === categoryId
    }).length
  }

  if (loading) {
    return (
      <Card className="h-[700px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-emerald-600" />
          <p className="text-gray-600 font-medium">Loading land plots...</p>
          <p className="text-gray-500 text-sm mt-2">Finding the best deals for you</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[700px] flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Unable to Load Map</h3>
          <p className="text-gray-600 mb-4 max-w-md">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Interactive Map Legend */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              Interactive Map Legend
            </CardTitle>
            {activeLegendFilters.length > 0 && (
              <Button
                onClick={clearLegendFilters}
                variant="outline"
                size="sm"
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Show All
              </Button>
            )}
          </div>
          <p className="text-sm text-emerald-700">Click on categories to filter map markers</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {DEAL_CATEGORIES.map((category) => {
              const count = getCategoryCount(category.id)
              const isActive = activeLegendFilters.includes(category.id)
              const isFiltered = activeLegendFilters.length > 0 && !isActive

              return (
                <button
                  key={category.id}
                  onClick={() => toggleLegendFilter(category.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? `${category.bgLight} ${category.borderColor} border-2 shadow-md`
                      : isFiltered
                        ? "bg-gray-100 border border-gray-200 opacity-50"
                        : "bg-white/60 border border-gray-200 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${category.bgColor} flex items-center justify-center shadow-sm`}
                  >
                    {category.id === "excellent" && <Zap className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${isFiltered ? "text-gray-500" : category.textColor}`}>
                      {category.name}
                    </div>
                    <div className={`text-xs ${isFiltered ? "text-gray-400" : "text-gray-600"}`}>
                      {category.description}
                    </div>
                    <div className={`text-xs font-medium ${isFiltered ? "text-gray-400" : "text-gray-700"}`}>
                      {count} properties
                    </div>
                  </div>
                  {isActive && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Map Container */}
      <Card className="overflow-hidden shadow-xl border-0">
        <CardContent className="p-0">
          <div className="h-[700px] w-full">
            <MapComponent 
              properties={filteredProperties} 
              onPropertySelect={onPropertySelect}
              dealCategories={DEAL_CATEGORIES}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Properties Count */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            Showing <span className="font-bold text-emerald-600">{filteredProperties.length}</span> of{" "}
            <span className="font-bold text-gray-600">{properties.length}</span> land plots
            {activeLegendFilters.length > 0 && (
              <span className="text-emerald-600"> (filtered by {activeLegendFilters.length} categories)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
