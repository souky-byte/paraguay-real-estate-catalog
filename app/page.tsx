"use client"

import { useState, useEffect, useCallback } from "react"
import type { Property } from "@/lib/database"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { PropertyDetailModal } from "@/components/property-detail-modal"
import { PropertyMap } from "@/components/property-map"
import { FullscreenMapDialog } from "@/components/fullscreen-map-dialog"
import { MarketAnalytics } from "@/components/market-analytics"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid, List, BarChart3, MapPin, TrendingDown, ChevronLeft, ChevronRight, Map, Maximize2 } from "lucide-react"

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortField, setSortField] = useState("price_per_sqm_diff_percent")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProperties, setTotalProperties] = useState(0)
  const [propertiesPerPage] = useState(24)
  const [showFullscreenMap, setShowFullscreenMap] = useState(false)

  const handleBlacklistProperty = async (propertyId: number) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId))

    try {
      const response = await fetch(`/api/properties/${propertyId}/blacklist`, {
        method: "PUT",
      })
      if (!response.ok) {
        // Handle error, maybe show a toast
        console.error("Failed to blacklist property")
        // Optionally, add the property back to the list
        fetchProperties()
      }
    } catch (error) {
      console.error("Error blacklisting property:", error)
      fetchProperties() // Re-fetch to get correct state
    }
  }

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "all" && value !== "any") {
          params.append(key, String(value))
        }
      })

      params.append("sort_field", sortField)
      params.append("sort_direction", sortDirection)
      params.append("limit", propertiesPerPage.toString())
      params.append("offset", ((currentPage - 1) * propertiesPerPage).toString())

      const response = await fetch(`/api/properties?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setProperties(data)
        if (data.length < propertiesPerPage && currentPage === 1) {
          setTotalProperties(data.length)
        } else {
          setTotalProperties(currentPage * propertiesPerPage + (data.length === propertiesPerPage ? 1 : 0))
        }
      } else {
        console.error("API returned non-array data:", data)
        setProperties([])
        setError("Invalid data format received from server")
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
      setProperties([])
      setError(error instanceof Error ? error.message : "Failed to fetch properties")
    } finally {
      setLoading(false)
    }
  }, [filters, sortField, sortDirection, currentPage, propertiesPerPage])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-")
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const hasNextPage = properties.length === propertiesPerPage
  const hasPrevPage = currentPage > 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Streamlined Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl shadow-sm">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Paraguay Land Deals</h1>
                <p className="text-sm text-gray-600">Find undervalued land plots</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50/80 px-4 py-2 rounded-xl border border-emerald-200/50">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Best deals first</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full">
          <PropertyFilters onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} />

          {/* Streamlined Controls with Show Map Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-emerald-600">{properties.length}</span> properties
                    {Object.keys(filters).some(
                      (key) => filters[key] && filters[key] !== "all" && filters[key] !== "any",
                    ) && <span className="text-emerald-600"> (filtered)</span>}
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Show Map Button */}
              <Button
                onClick={() => setShowFullscreenMap(true)}
                variant="outline"
                className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 font-medium"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Show Map
              </Button>

              <Select value={`${sortField}-${sortDirection}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48 h-9 bg-white/50 border-gray-200/70 focus:bg-white focus:border-emerald-400 rounded-lg text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-gray-200/70">
                  <SelectItem value="price_per_sqm_diff_percent-asc">🔥 Best Deals</SelectItem>
                  <SelectItem value="sale_price_diff_percent-asc">💰 Price Deals</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="m2-desc">Area: Large to Small</SelectItem>
                  <SelectItem value="m2-asc">Area: Small to Large</SelectItem>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center bg-gray-100/80 rounded-lg p-0.5">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200/50"}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-8 w-8 p-0 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200/50"}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Properties Grid/List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/80 rounded-xl border border-gray-200/50">
                  <div className="bg-gray-200 h-48 rounded-t-xl mb-3"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-white/50 rounded-lg">
              <p className="text-red-500">{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10 bg-white/50 rounded-lg">
              <p className="text-gray-500">No properties found.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewMode="grid"
                  onViewDetails={handleViewDetails}
                  onBlacklist={handleBlacklistProperty}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewMode="list"
                  onViewDetails={handleViewDetails}
                  onBlacklist={handleBlacklistProperty}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalProperties > propertiesPerPage && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                variant="outline"
                className="bg-white/50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">Page {currentPage}</span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                variant="outline"
                className="bg-white/50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          open={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      <FullscreenMapDialog
        isOpen={showFullscreenMap}
        onClose={() => setShowFullscreenMap(false)}
        onPropertySelect={handleViewDetails}
        filters={filters}
      />
    </div>
  )
}
