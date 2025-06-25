"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Icon, LatLngBounds } from "leaflet"
import Image from "next/image"
import type { Property } from "@/lib/database"
import { BlacklistButton } from "@/components/ui/blacklist-button"
import { useBlacklist } from "@/hooks/use-blacklist"

// Import Leaflet CSS
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"

interface PropertyMapClientProps {
  properties: Property[]
  onPropertySelect: (property: Property) => void
  dealCategories: Array<{
    id: string
    name: string
    description: string
    color: string
    bgColor: string
    hoverBg: string
    textColor: string
    bgLight: string
    borderColor: string
    icon: string
    range: (diff: number) => boolean
  }>
}

export default function PropertyMapClient({ properties, onPropertySelect, dealCategories }: PropertyMapClientProps) {
  // Blacklist hook
  const { blacklistProperty, isBlacklisted, isLoading } = useBlacklist({
    onSuccess: (propertyId) => {
      // Optionally refresh properties or handle success
      console.log(`Property ${propertyId} blacklisted successfully`)
    }
  })
  // Helper functions
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

  const getMarkerIcon = (diffPercent: number) => {
    const category = dealCategories.find((cat) => cat.range(diffPercent))
    const color = category?.color || "#eab308"
    const isHotDeal = diffPercent < -20

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          <path d="M16 0C7.2 0 0 7.2 0 16C0 24.8 16 48 16 48S32 24.8 32 16C32 7.2 24.8 0 16 0Z" fill="${color}" filter="url(#shadow)"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          ${
            isHotDeal
              ? '<path d="M10 10L22 10L20 15L25 15L14 26L17 18L12 18L10 10Z" fill="#fbbf24"/>'
              : '<circle cx="16" cy="16" r="6" fill="' + color + '"/>'
          }
        </svg>
      `)}`,
      iconSize: [32, 48],
      iconAnchor: [16, 48],
      popupAnchor: [0, -48],
    })
  }

  // Calculate map bounds
  const bounds = useMemo(() => {
    const validProperties = properties.filter(p => p.latitude && p.longitude)
    if (validProperties.length === 0) return null

    const coordinates = validProperties.map(p => [p.latitude!, p.longitude!] as [number, number])
    
    if (coordinates.length === 1) {
      return null // Let single point use default center
    }

    return new LatLngBounds(coordinates)
  }, [properties])

  // Default center (Paraguay)
  const defaultCenter: [number, number] = [-25.2637, -57.5759]
  const defaultZoom = 7

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      bounds={bounds || undefined}
      boundsOptions={{ padding: [20, 20] }}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
      />
      
      {properties.map((property) => {
        if (!property.latitude || !property.longitude) return null

        const category = dealCategories.find((cat) => cat.range(property.price_per_sqm_diff_percent))
        
        return (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={getMarkerIcon(property.price_per_sqm_diff_percent)}
          >
            <Popup maxWidth={400} className="custom-popup">
              <div className="w-96 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Image Section */}
                <div className="relative h-40">
                  <Image 
                    src={property.image_urls?.[0] || "/placeholder.svg?height=160&width=384"} 
                    alt={property.title}
                    width={384}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Hot Deal Badge */}
                  {property.price_per_sqm_diff_percent < -20 && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        🔥 HOT DEAL
                      </span>
                    </div>
                  )}
                  
                  {/* Area Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                      </svg>
                      {formatArea(property.m2)}
                    </div>
                  </div>
                  
                  {/* Price Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-white">
                      <div className="text-2xl font-bold mb-1 drop-shadow-lg">
                        {formatPrice(property.price, property.currency)}
                      </div>
                      <div className="text-sm opacity-90 font-medium drop-shadow">
                        {property.m2 > 0 ? `${formatPrice(property.price / property.m2, property.currency)}/m²` : "Price per m² N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-5 space-y-4">
                  {/* Header with badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">LAND PLOT</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">{property.zone}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">{property.title}</h3>
                  
                  {/* Location */}
                  <div className="flex items-start text-gray-600">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-sm line-clamp-2 leading-relaxed">{property.address}</span>
                  </div>
                  
                  {/* Deal Badge */}
                  {category && (
                    <div className="flex justify-center">
                      <span className={`text-xs ${category.bgColor} text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-1`}>
                        {category.icon}
                        {Math.abs(property.price_per_sqm_diff_percent)}% {category.name.toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{property.description_short}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPropertySelect(property)
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                      </svg>
                      View Details
                    </button>
                    
                    <BlacklistButton
                      propertyId={property.id}
                      onBlacklist={blacklistProperty}
                      isLoading={isLoading(property.id)}
                      isBlacklisted={isBlacklisted(property.id)}
                      size="default"
                      variant="ghost"
                      className="flex-shrink-0"
                    />
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
      
      {/* Custom CSS for popup styling */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent;
          border-radius: 12px;
          box-shadow: none;
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
          border: 1px solid #e5e7eb;
        }
        .leaflet-popup-close-button {
          color: #6b7280 !important;
          font-size: 18px !important;
          padding: 8px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #374151 !important;
        }
      `}</style>
    </MapContainer>
  )
} 