"use client"

import type { Property } from "@/lib/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Bed, Bath, Car, Square, Calendar, TrendingUp, TrendingDown, ExternalLink, Clock } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface PropertyDetailModalProps {
  property: Property | null
  open: boolean
  onClose: () => void
}

export function PropertyDetailModal({ property, open, onClose }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!property) return null

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

  const getPriceTrend = (diffPercent: number, label: string) => {
    if (diffPercent > 0) {
      return { icon: TrendingUp, color: "text-green-600", value: `+${diffPercent}%`, label }
    } else if (diffPercent < 0) {
      return { icon: TrendingDown, color: "text-red-600", value: `${diffPercent}%`, label }
    }
    return null
  }

  const priceTrend = getPriceTrend(property.price_per_sqm_diff_percent, "vs avg price/m²")
  const saleTrend = getPriceTrend(property.sale_price_diff_percent, "vs avg sale price")
  const timeTrend = getPriceTrend(property.publication_time_diff_percent, "vs avg publication time")

  // Construct the full URL
  const fullUrl = `https://www.infocasas.com.py${property.link}`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{property.title}</DialogTitle>
          <DialogDescription>
            Detailed information about the property.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative h-64 lg:h-80">
              <Image
                src={property.image_urls?.[currentImageIndex] || "/placeholder.svg?height=320&width=480"}
                alt={property.title}
                fill
                className="object-cover rounded-lg"
              />
              {property.sold && <Badge className="absolute top-2 left-2 bg-red-600">SOLD</Badge>}
            </div>

            {property.image_urls && property.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {property.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden ${
                      index === currentImageIndex ? "border-primary" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            {/* Price and Basic Info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-sm">
                  {property.property_type}
                </Badge>
                <p className="text-2xl font-bold text-primary">{formatPrice(property.price, property.currency)}</p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  <span>{property.m2} m²</span>
                </div>
                {property.bedrooms !== "¡Preguntale!" && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                )}
                {property.bathrooms !== "¡Preguntale!" && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                )}
                {property.garages !== "¡Preguntale!" && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span>{property.garages} garages</span>
                  </div>
                )}
                {property.year_built !== "¡Preguntale!" && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Built {property.year_built}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Market Analytics */}
            <div>
              <h3 className="font-semibold mb-3">Market Analytics</h3>
              <div className="space-y-3">
                {priceTrend && (
                  <div className={`flex items-center justify-between p-3 rounded-lg bg-gray-50 ${priceTrend.color}`}>
                    <div className="flex items-center gap-2">
                      <priceTrend.icon className="w-4 h-4" />
                      <span className="font-medium">{priceTrend.value}</span>
                    </div>
                    <span className="text-sm">{priceTrend.label}</span>
                  </div>
                )}

                {saleTrend && (
                  <div className={`flex items-center justify-between p-3 rounded-lg bg-gray-50 ${saleTrend.color}`}>
                    <div className="flex items-center gap-2">
                      <saleTrend.icon className="w-4 h-4" />
                      <span className="font-medium">{saleTrend.value}</span>
                    </div>
                    <span className="text-sm">{saleTrend.label}</span>
                  </div>
                )}

                {timeTrend && (
                  <div className={`flex items-center justify-between p-3 rounded-lg bg-gray-50 ${timeTrend.color}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{timeTrend.value}</span>
                    </div>
                    <span className="text-sm">vs avg time on market</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg Price/m²:</span>
                    <p className="font-medium">{property.price_per_sqm_avg_price}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Sale Price:</span>
                    <p className="font-medium">{property.sale_price_avg_price}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{property.description_full}</p>
            </div>

            <Separator />

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Reference:</span>
                <p className="font-medium">{property.reference_code}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Zone:</span>
                <p className="font-medium">{property.zone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Listed:</span>
                <p className="font-medium">{new Date(property.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <p className="font-medium">{new Date(property.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Action Button */}
            <Button className="w-full" asChild>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Original Listing
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
