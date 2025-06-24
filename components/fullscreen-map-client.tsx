"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { Icon, LatLngBounds } from "leaflet"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Property } from "@/lib/database"

// Import Leaflet CSS
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"

interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

interface FullscreenMapClientProps {
  properties: Property[]
  onPropertySelect: (property: Property) => void
  onBoundsChange: (bounds: MapBounds) => void
  hoveredPropertyId?: string | null
  activeLegendFilters?: string[]
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

// Map events component to handle bounds changes
function MapEventsHandler({ onBoundsChange }: { onBoundsChange: (bounds: MapBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    },
    zoomend: () => {
      const bounds = map.getBounds()
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    },
  })

  // Initial bounds set - only once when map is ready
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const bounds = map.getBounds()
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [map]) // Removed onBoundsChange from dependencies to prevent infinite loop

  return null
}

export default function FullscreenMapClient({ 
  properties, 
  onPropertySelect, 
  onBoundsChange, 
  dealCategories,
  hoveredPropertyId,
  activeLegendFilters = []
}: FullscreenMapClientProps) {
  // Get property category helper
  const getPropertyCategory = (diffPercent: number) => {
    return dealCategories.find((cat) => cat.range(diffPercent))?.id || "fair"
  }

  // Filter properties based on active legend filters
  const filteredProperties = useMemo(() => {
    if (activeLegendFilters.length === 0) return properties
    
    return properties.filter((property) => {
      const category = getPropertyCategory(property.price_per_sqm_diff_percent)
      return activeLegendFilters.includes(category)
    })
  }, [properties, activeLegendFilters, dealCategories])

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

  const getMarkerIcon = (diffPercent: number, isDimmed: boolean = false, isHighlighted: boolean = false) => {
    const category = dealCategories.find((cat) => cat.range(diffPercent))
    const color = category?.color || "#eab308"
    const isHotDeal = diffPercent < -20
    
    // Apply dimming effect
    const finalColor = isDimmed ? "#9ca3af" : color
    const opacity = isDimmed ? 0.4 : 1
    const scale = isHighlighted ? 1.4 : 1
    const baseSize = 36 // Larger base size for better quality
    
    // Generate unique IDs for this icon
    const uid = Math.random().toString(36).substr(2, 9)

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="${baseSize * scale}" height="${baseSize * scale * 1.3}" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Main gradient for pin -->
            <linearGradient id="pinGradient-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${finalColor};stop-opacity:1" />
              <stop offset="50%" style="stop-color:${finalColor};stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:${isDimmed ? '#6b7280' : adjustBrightness(finalColor, -30)};stop-opacity:1" />
            </linearGradient>
            
            <!-- Shadow filter -->
            <filter id="shadow-${uid}" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="${isHighlighted ? 6 : 4}" stdDeviation="${isHighlighted ? 6 : 4}" 
                           flood-color="rgba(0,0,0,${isDimmed ? 0.2 : 0.3})" flood-opacity="1"/>
            </filter>
            
            <!-- Glow effect for highlighted pins -->
            ${isHighlighted ? `
              <filter id="glow-${uid}" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            ` : ''}
            
            <!-- Inner highlight gradient -->
            <radialGradient id="innerGradient-${uid}" cx="50%" cy="25%" r="70%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.9);stop-opacity:1" />
              <stop offset="70%" style="stop-color:rgba(255,255,255,0.3);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
            </radialGradient>
            
            <!-- Metallic shine effect -->
            <linearGradient id="shineGradient-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
              <stop offset="50%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <g opacity="${opacity}" ${isHighlighted ? `filter="url(#glow-${uid})"` : ''}>
            <!-- Main pin shape - modern rounded style -->
            <path d="M20 6C13 6 7.5 11.5 7.5 18C7.5 27 20 46 20 46S32.5 27 32.5 18C32.5 11.5 27 6 20 6Z" 
                  fill="url(#pinGradient-${uid})" 
                  filter="url(#shadow-${uid})" 
                  stroke="${isDimmed ? 'rgba(107, 114, 128, 0.3)' : 'rgba(0,0,0,0.15)'}" 
                  stroke-width="0.5"/>
            
            <!-- Inner highlight for 3D effect -->
            <path d="M20 8C14.2 8 9.5 12.7 9.5 18C9.5 25.5 20 42 20 42S30.5 25.5 30.5 18C30.5 12.7 25.8 8 20 8Z" 
                  fill="url(#innerGradient-${uid})"/>
            
            <!-- Shine effect -->
            <ellipse cx="16" cy="12" rx="3" ry="8" 
                     fill="url(#shineGradient-${uid})"
                     transform="rotate(-20 16 12)" opacity="0.6"/>
            
            <!-- Center white circle -->
            <circle cx="20" cy="18" r="8" 
                    fill="white" 
                    stroke="${isDimmed ? 'rgba(156, 163, 175, 0.3)' : 'rgba(0,0,0,0.1)'}" 
                    stroke-width="0.5"
                    filter="url(#shadow-${uid})"/>
            
            <!-- Content circle or lightning -->
            ${
              isHotDeal
                ? `<g transform="translate(20,18)">
                     <!-- Lightning bolt for hot deals -->
                     <path d="M-3.5 -5L3.5 -5L2 -1.5L5 -1.5L-2 6L2 2L-2.5 2L-3.5 -5Z" 
                           fill="${isDimmed ? '#9ca3af' : '#f59e0b'}" 
                           stroke="${isDimmed ? '#6b7280' : '#d97706'}" 
                           stroke-width="0.5"
                           stroke-linejoin="round"/>
                     <!-- Inner highlight on lightning -->
                     <path d="M-2.5 -4L2.5 -4L1.5 -2L3.5 -2L-1 4.5L1 1.5L-1.5 1.5L-2.5 -4Z" 
                           fill="${isDimmed ? '#d1d5db' : '#fbbf24'}" 
                           opacity="0.8"/>
                   </g>`
                : `<circle cx="20" cy="18" r="5.5" 
                           fill="url(#pinGradient-${uid})" 
                           stroke="rgba(0,0,0,0.1)" 
                           stroke-width="0.3"/>
                   <!-- Inner shine on content circle -->
                   <circle cx="18.5" cy="16.5" r="2" 
                           fill="rgba(255,255,255,0.4)" 
                           opacity="0.8"/>`
            }
            
            <!-- Price indicator badge for significant deals -->
            ${Math.abs(diffPercent) > 15 ? `
              <g transform="translate(30, 10)">
                <circle r="4.5" fill="#ef4444" stroke="white" stroke-width="1.5"/>
                <circle r="3" fill="#dc2626"/>
                <text y="1.5" text-anchor="middle" 
                      font-family="system-ui, -apple-system, sans-serif" 
                      font-size="7" font-weight="900" 
                      fill="white">!</text>
              </g>
            ` : ''}
          </g>
        </svg>
      `)}`,
      iconSize: [baseSize * scale, baseSize * scale * 1.3],
      iconAnchor: [baseSize * scale / 2, baseSize * scale * 1.3],
      popupAnchor: [0, -baseSize * scale * 1.3],
    })
  }

  // Helper function to adjust color brightness
  const adjustBrightness = (color: string, percent: number) => {
    const num = parseInt(color.replace("#",""), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + 
                               (G<255?G<1?0:G:255)*0x100 + 
                               (B<255?B<1?0:B:255)).toString(16).slice(1)
  }

  // Calculate map bounds based on filtered properties
  const bounds = useMemo(() => {
    const validProperties = filteredProperties.filter(p => p.latitude && p.longitude)
    if (validProperties.length === 0) return null

    const coordinates = validProperties.map(p => [p.latitude!, p.longitude!] as [number, number])
    
    if (coordinates.length === 1) {
      return null // Let single point use default center
    }

    return new LatLngBounds(coordinates)
  }, [filteredProperties])

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
      
      {/* Map events handler for bounds changes */}
      <MapEventsHandler onBoundsChange={onBoundsChange} />
      
      {filteredProperties.map((property) => {
        if (!property.latitude || !property.longitude) return null

        const category = dealCategories.find((cat) => cat.range(property.price_per_sqm_diff_percent))
        const propertyIdStr = String(property.id)
        const isHovered = hoveredPropertyId === propertyIdStr
        const isDimmed = hoveredPropertyId !== null && hoveredPropertyId !== propertyIdStr
        
        return (
          <motion.div
            key={property.id}
            initial={false}
            animate={{
              scale: isHovered ? 1.1 : isDimmed ? 0.9 : 1,
              opacity: isDimmed ? 0.3 : 1,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            <Marker
              position={[property.latitude, property.longitude]}
              icon={getMarkerIcon(property.price_per_sqm_diff_percent, isDimmed, isHovered)}
              zIndexOffset={isHovered ? 1000 : isDimmed ? -100 : 0}
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
                  
                  {/* Action Button */}
                  <button 
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                </div>
              </div>
            </Popup>
            </Marker>
          </motion.div>
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