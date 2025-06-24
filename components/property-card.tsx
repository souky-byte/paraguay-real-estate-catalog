"use client"

import type { Property } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Square, TrendingDown, Eye, Zap } from "lucide-react"
import Image from "next/image"

interface PropertyCardProps {
  property: Property
  viewMode: "grid" | "list"
  onViewDetails: (property: Property) => void
}

export function PropertyCard({ property, viewMode, onViewDetails }: PropertyCardProps) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === "Gs." || currency === "PYG") {
      if (price >= 1000000000) {
        return `${currency} ${(price / 1000000000).toFixed(1)}B`
      } else if (price >= 1000000) {
        return `${currency} ${(price / 1000000).toFixed(1)}M`
      }
      return `${currency} ${price.toLocaleString()}`
    }
    // USD or other currencies
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

  const formatPricePerM2 = (price: number, m2: number, currency: string) => {
    if (m2 > 0) {
      const pricePerM2 = price / m2
      if (currency === "Gs." || currency === "PYG") {
        if (pricePerM2 >= 1000000) {
          return `${currency} ${(pricePerM2 / 1000000).toFixed(1)}M/m²`
        }
        return `${currency} ${pricePerM2.toLocaleString()}/m²`
      }
      // USD
      if (pricePerM2 >= 1000) {
        return `$${(pricePerM2 / 1000).toFixed(1)}K/m²`
      }
      return `$${pricePerM2.toLocaleString()}/m²`
    }
    return "N/A"
  }

  const getPriceTrend = (diffPercent: number) => {
    if (diffPercent < -20) {
      return {
        icon: TrendingDown,
        color: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white",
        value: `${Math.abs(diffPercent)}%`,
        label: "EXCELLENT DEAL",
        isHot: true,
      }
    } else if (diffPercent < -10) {
      return {
        icon: TrendingDown,
        color: "bg-gradient-to-r from-green-600 to-green-500 text-white",
        value: `${Math.abs(diffPercent)}%`,
        label: "GOOD DEAL",
        isHot: false,
      }
    } else if (diffPercent < 0) {
      return {
        icon: TrendingDown,
        color: "bg-gradient-to-r from-green-500 to-green-400 text-white",
        value: `${Math.abs(diffPercent)}%`,
        label: "BELOW MARKET",
        isHot: false,
      }
    }
    return null
  }

  const priceTrend = getPriceTrend(property.price_per_sqm_diff_percent)

  if (viewMode === "list") {
    return (
      <Card className="mb-4 hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            {/* Image Section */}
            <div className="relative w-80 h-56 flex-shrink-0">
              <Image
                src={property.image_urls?.[0] || "/placeholder.svg?height=224&width=320"}
                alt={property.title}
                fill
                className="object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Hot Deal Badge */}
              {priceTrend?.isHot && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold px-3 py-1.5 text-xs shadow-lg border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    HOT DEAL
                  </Badge>
                </div>
              )}

              {/* Area Badge */}
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <Square className="w-4 h-4 text-gray-700" />
                  <span className="font-bold text-gray-900 text-sm">{formatArea(property.m2)}</span>
                </div>
              </div>

              {/* Sold Badge */}
              {property.sold && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gray-900 hover:bg-gray-900 text-white font-bold px-3 py-1.5 text-xs shadow-lg border-0">
                    SOLD
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              {/* Header */}
              <div>
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50">
                    LAND PLOT
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-medium border-0">
                    {property.zone}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">{property.title}</h3>

                {/* Location */}
                <div className="flex items-start text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                  <span className="text-sm leading-relaxed">{property.address}</span>
                </div>

                {/* Price Trend */}
                {priceTrend && (
                  <div className="mb-4">
                    <Badge className={`${priceTrend.color} px-4 py-2 font-bold text-sm shadow-lg border-0`}>
                      <TrendingDown className="w-4 h-4 mr-2" />
                      {priceTrend.value} BELOW MARKET
                    </Badge>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{property.description_short}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                {/* Price */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(property.price, property.currency)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {formatPricePerM2(property.price, property.m2, property.currency)}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onViewDetails(property)}
                  className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white group">
      {/* Image Section */}
      <div className="relative h-64">
        <Image
          src={property.image_urls?.[0] || "/placeholder.svg?height=256&width=400"}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {priceTrend?.isHot && (
            <Badge className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold px-3 py-1.5 text-xs shadow-lg border-0">
              <Zap className="w-3 h-3 mr-1" />
              HOT DEAL
            </Badge>
          )}
        </div>

        {property.sold && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gray-900 hover:bg-gray-900 text-white font-bold px-3 py-1.5 text-xs shadow-lg border-0">
              SOLD
            </Badge>
          </div>
        )}

        {/* Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="text-white">
            <div className="text-2xl font-bold mb-1 drop-shadow-lg">
              {formatPrice(property.price, property.currency)}
            </div>
            <div className="text-sm opacity-90 font-medium drop-shadow">
              {formatPricePerM2(property.price, property.m2, property.currency)}
            </div>
          </div>
        </div>

        {/* Area Badge */}
        <div className="absolute top-4 right-4 mr-16">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <Square className="w-4 h-4 text-gray-700" />
            <span className="font-bold text-gray-900 text-sm">{formatArea(property.m2)}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-5">
        {/* Header with badges */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50">
            LAND PLOT
          </Badge>
          <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-medium border-0">
            {property.zone}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 leading-tight text-lg">{property.title}</h3>

        {/* Location */}
        <div className="flex items-start text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
          <span className="text-sm line-clamp-2 leading-relaxed">{property.address}</span>
        </div>

        {/* Price Trend */}
        {priceTrend && (
          <div className="mb-4">
            <Badge className={`${priceTrend.color} px-3 py-1.5 font-bold text-xs shadow-lg border-0`}>
              <TrendingDown className="w-3 h-3 mr-1" />
              {priceTrend.value} BELOW MARKET
            </Badge>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">{property.description_short}</p>

        {/* Action Button */}
        <Button
          onClick={() => onViewDetails(property)}
          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
