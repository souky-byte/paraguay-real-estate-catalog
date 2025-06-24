"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Search, X, Filter, ChevronDown, DollarSign, Square } from "lucide-react"

interface FilterValues {
  zones: string[]
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function PropertyFilters({ onFiltersChange, onClearFilters }: PropertyFiltersProps) {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    zones: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPriceSlider, setShowPriceSlider] = useState(false)
  const [showAreaSlider, setShowAreaSlider] = useState(false)

  const priceRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState({
    search: "",
    zone: "all",
    min_price: 0,
    max_price: 2000000000,
    min_m2: 0,
    max_m2: 10000,
  })

  const [priceRange, setPriceRange] = useState([0, 2000000000])
  const [areaRange, setAreaRange] = useState([0, 10000])

  // Format price for display
  const formatPriceForDisplay = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    }
    return `${(price / 1000000).toFixed(0)}M`
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setShowPriceSlider(false)
      }
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setShowAreaSlider(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    fetchFilterValues()
  }, [])

  const fetchFilterValues = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/properties/filters")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setFilterValues({
        zones: Array.isArray(data.zones) ? data.zones : [],
      })
    } catch (error) {
      console.error("Error fetching filter values:", error)
      setError(error instanceof Error ? error.message : "Failed to load filter options")
      setFilterValues({
        zones: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    const newFilters = { ...filters, min_price: value[0], max_price: value[1] }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAreaRangeChange = (value: number[]) => {
    setAreaRange(value)
    const newFilters = { ...filters, min_m2: value[0], max_m2: value[1] }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      zone: "all",
      min_price: 0,
      max_price: 2000000000,
      min_m2: 0,
      max_m2: 10000,
    }
    setFilters(clearedFilters)
    setPriceRange([0, 2000000000])
    setAreaRange([0, 10000])
    setShowPriceSlider(false)
    setShowAreaSlider(false)
    onClearFilters()
  }

  const hasActiveFilters =
    filters.search ||
    filters.zone !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 2000000000 ||
    areaRange[0] > 0 ||
    areaRange[1] < 10000

  const activeFiltersCount = [
    filters.search,
    filters.zone !== "all" ? filters.zone : null,
    priceRange[0] > 0 || priceRange[1] < 2000000000 ? "price" : null,
    areaRange[0] > 0 || areaRange[1] < 10000 ? "area" : null,
  ].filter(Boolean).length

  const isPriceFiltered = priceRange[0] > 0 || priceRange[1] < 2000000000
  const isAreaFiltered = areaRange[0] > 0 || areaRange[1] < 10000

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 mb-6">
        <div className="animate-pulse">
          <div className="flex gap-3">
            <div className="h-9 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-9 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-9 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-9 bg-gray-200 rounded-lg w-32"></div>
            <div className="h-9 bg-gray-200 rounded-lg w-20"></div>
            <div className="h-9 bg-gray-200 rounded-lg w-16"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 mb-6 shadow-sm relative z-50">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Icon */}
        <div className="flex items-center gap-2 text-gray-500 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:block">Filters</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search location, title..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-9 h-9 border-gray-200/70 bg-white/50 focus:bg-white focus:border-emerald-400 transition-all text-sm"
          />
        </div>

        {/* Zone */}
        <Select value={filters.zone} onValueChange={(value) => handleFilterChange("zone", value)}>
          <SelectTrigger className="w-[140px] h-9 border-gray-200/70 bg-white/50 focus:bg-white focus:border-emerald-400 text-sm">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {filterValues.zones.map((zone) => (
              <SelectItem key={zone} value={zone}>
                {zone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Range Dropdown */}
        <div className="relative" ref={priceRef}>
          <Button
            variant="outline"
            onClick={() => {
              setShowPriceSlider(!showPriceSlider)
              setShowAreaSlider(false)
            }}
            className={`h-9 px-3 border-gray-200/70 bg-white/50 hover:bg-white hover:border-emerald-400 text-sm transition-all ${
              isPriceFiltered ? "border-emerald-400 bg-emerald-50 text-emerald-700" : ""
            }`}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            <span>Price</span>
            {isPriceFiltered && <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2"></div>}
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showPriceSlider ? "rotate-180" : ""}`} />
          </Button>

          {showPriceSlider && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-5 w-80 z-[9999]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Price Range</span>
                  <span className="text-xs text-gray-500">
                    {formatPriceForDisplay(priceRange[0])} - {formatPriceForDisplay(priceRange[1])} Gs.
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={2000000000}
                  min={0}
                  step={10000000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 Gs.</span>
                  <span>2.0B Gs.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Area Range Dropdown */}
        <div className="relative" ref={areaRef}>
          <Button
            variant="outline"
            onClick={() => {
              setShowAreaSlider(!showAreaSlider)
              setShowPriceSlider(false)
            }}
            className={`h-9 px-3 border-gray-200/70 bg-white/50 hover:bg-white hover:border-emerald-400 text-sm transition-all ${
              isAreaFiltered ? "border-emerald-400 bg-emerald-50 text-emerald-700" : ""
            }`}
          >
            <Square className="w-4 h-4 mr-1" />
            <span>Area</span>
            {isAreaFiltered && <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2"></div>}
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAreaSlider ? "rotate-180" : ""}`} />
          </Button>

          {showAreaSlider && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-[9999]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Area Range</span>
                  <span className="text-xs text-gray-500">
                    {areaRange[0]} - {areaRange[1]} m²
                  </span>
                </div>
                <Slider
                  value={areaRange}
                  onValueChange={handleAreaRangeChange}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 m²</span>
                  <span>10,000 m²</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button - Always visible */}
        <Button
          onClick={clearAllFilters}
          variant="outline"
          size="sm"
          disabled={!hasActiveFilters}
          className="h-9 px-3 border-gray-200/70 bg-white/50 hover:bg-white hover:border-red-400 hover:text-red-600 transition-all text-sm disabled:opacity-50"
        >
          <X className="w-4 h-4 mr-1" />
          <span>Clear</span>
        </Button>

        {/* Active Filters Count - Always visible */}
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 min-w-[60px] justify-center">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${activeFiltersCount > 0 ? "bg-emerald-500" : "bg-gray-300"}`}
          ></div>
          <span
            className={`text-xs font-medium transition-colors ${activeFiltersCount > 0 ? "text-emerald-700" : "text-gray-500"}`}
          >
            {activeFiltersCount}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          Error loading filters: {error}
        </div>
      )}
    </div>
  )
}
