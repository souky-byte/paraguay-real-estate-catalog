import { neon } from "@neondatabase/serverless"

// Ensure DATABASE_URL is available, with fallback for build time
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ""

if (!databaseUrl && process.env.NODE_ENV !== "development") {
  console.warn("No database connection string found. Please set DATABASE_URL environment variable.")
}

const sql = databaseUrl ? neon(databaseUrl) : null

export interface Property {
  id: number
  title: string
  price: number
  currency: string
  m2: number
  link: string
  address: string
  description_short: string
  reference_code: string
  property_type: string
  zone: string
  description_full: string
  image_urls: string[]
  bathrooms?: string
  bedrooms?: string
  garages?: string
  year_built?: string
  built_area_m2?: string
  price_per_sqm_avg_price: string
  price_per_sqm_diff_percent: number // Negative = below market (good deal)
  sale_price_avg_price: string
  sale_price_diff_percent: number // Negative = below market (good deal)
  publication_time_avg: string
  publication_time_diff_percent: number
  created_at: string
  updated_at: string
  sold: boolean
  latitude?: number
  longitude?: number
}

export interface PropertyFilters {
  search?: string
  zone?: string
  min_price?: number
  max_price?: number
  min_m2?: number
  max_m2?: number
  sold?: boolean
}

export interface PropertySort {
  field: "price" | "m2" | "created_at" | "price_per_sqm_diff_percent" | "sale_price_diff_percent"
  direction: "asc" | "desc"
}

export async function getProperties(
  filters: PropertyFilters = {},
  sort: PropertySort = { field: "price_per_sqm_diff_percent", direction: "asc" },
  limit = 24,
  offset = 0,
): Promise<Property[]> {
  if (!sql) {
    console.error("Database connection not available")
    return []
  }

  try {
    // Handle different sorting scenarios with proper currency conversion
    if (sort.field === "price") {
      // Price sorting with currency conversion
      if (sort.direction === "asc") {
        if (filters.search && filters.zone) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND zone = ${filters.zone}
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.search) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.zone) {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND zone = ${filters.zone} AND blacklisted = false
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        }
      } else {
        // Price DESC
        if (filters.search && filters.zone) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND zone = ${filters.zone}
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.search) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.zone) {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND zone = ${filters.zone} AND blacklisted = false
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            ORDER BY (CASE WHEN currency = 'Gs.' THEN price / 8000 ELSE price END) DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        }
      }
    }

    // Handle other sorting fields
    if (sort.field === "m2") {
      if (sort.direction === "asc") {
        if (filters.search && filters.zone) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND zone = ${filters.zone}
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY m2 ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.search) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY m2 ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.zone) {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND zone = ${filters.zone} AND blacklisted = false
            ORDER BY m2 ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            ORDER BY m2 ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        }
      } else {
        // m2 DESC
        if (filters.search && filters.zone) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND zone = ${filters.zone}
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY m2 DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.search) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY m2 DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.zone) {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND zone = ${filters.zone} AND blacklisted = false
            ORDER BY m2 DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            ORDER BY m2 DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        }
      }
    }

    if (sort.field === "created_at") {
      if (sort.direction === "desc") {
        if (filters.search && filters.zone) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND zone = ${filters.zone}
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.search) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.zone) {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND zone = ${filters.zone} AND blacklisted = false
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        }
      }
    }

    if (sort.field === "sale_price_diff_percent") {
      if (sort.direction === "asc") {
        if (filters.search && filters.zone) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND zone = ${filters.zone}
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY sale_price_diff_percent ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.search) {
          const searchTerm = `%${filters.search}%`
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
            ORDER BY sale_price_diff_percent ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else if (filters.zone) {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND zone = ${filters.zone} AND blacklisted = false
            ORDER BY sale_price_diff_percent ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        } else {
          const result = await sql`
            SELECT * FROM properties 
            WHERE property_type = 'Terreno' AND blacklisted = false
            ORDER BY sale_price_diff_percent ASC
            LIMIT ${limit} OFFSET ${offset}
          `
          return Array.isArray(result) ? (result as Property[]) : []
        }
      }
    }

    // Default case: price_per_sqm_diff_percent ASC (best deals first)
    if (filters.search && filters.zone) {
      const searchTerm = `%${filters.search}%`
      const result = await sql`
        SELECT * FROM properties 
        WHERE property_type = 'Terreno' AND blacklisted = false
        AND zone = ${filters.zone}
        AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
        ORDER BY price_per_sqm_diff_percent ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      return Array.isArray(result) ? (result as Property[]) : []
    } else if (filters.search) {
      const searchTerm = `%${filters.search}%`
      const result = await sql`
        SELECT * FROM properties 
        WHERE property_type = 'Terreno' AND blacklisted = false
        AND (title ILIKE ${searchTerm} OR address ILIKE ${searchTerm} OR description_short ILIKE ${searchTerm})
        ORDER BY price_per_sqm_diff_percent ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      return Array.isArray(result) ? (result as Property[]) : []
    } else if (filters.zone) {
      const result = await sql`
        SELECT * FROM properties 
        WHERE property_type = 'Terreno' AND zone = ${filters.zone} AND blacklisted = false
        ORDER BY price_per_sqm_diff_percent ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      return Array.isArray(result) ? (result as Property[]) : []
    } else {
      const result = await sql`
        SELECT * FROM properties 
        WHERE property_type = 'Terreno' AND blacklisted = false
        ORDER BY price_per_sqm_diff_percent ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      return Array.isArray(result) ? (result as Property[]) : []
    }
  } catch (error) {
    console.error("Database error in getProperties:", error)
    return []
  }
}

// New function to get properties with coordinates for map view
export async function getPropertiesForMap(
  filters: PropertyFilters = {},
  limit = 200, // More properties for map view
): Promise<Property[]> {
  if (!sql) {
    console.error("Database connection not available")
    return []
  }

  try {
    // Get properties with valid coordinates
    const result = await sql`
      SELECT * FROM properties 
      WHERE property_type = 'Terreno' AND blacklisted = false
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
      AND latitude != 0 
      AND longitude != 0
      ORDER BY price_per_sqm_diff_percent ASC
      LIMIT ${limit}
    `
    return Array.isArray(result) ? (result as Property[]) : []
  } catch (error) {
    console.error("Database error in getPropertiesForMap:", error)
    return []
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!sql) {
    console.error("Database connection not available")
    return null
  }

  try {
    const numericId = Number.parseInt(id)
    const result = await sql`SELECT * FROM properties WHERE id = ${numericId}`
    return (result[0] as Property) || null
  } catch (error) {
    console.error("Database error in getPropertyById:", error)
    return null
  }
}

export async function getPropertyStats() {
  if (!sql) {
    console.error("Database connection not available")
    return {
      total: 0,
      avgPrice: 0,
      avgM2: 0,
      avgPricePerM2: 0,
      zones: [],
      soldCount: 0,
      bestDealsCount: 0,
    }
  }

  try {
    // Only terrenos (land plots)
    const totalProperties = await sql`SELECT COUNT(*) as count FROM properties WHERE property_type = 'Terreno' AND blacklisted = false`
    const avgPrice =
      await sql`SELECT AVG(price) as avg_price FROM properties WHERE property_type = 'Terreno' AND blacklisted = false AND price > 0`
    const avgM2 = await sql`SELECT AVG(m2) as avg_m2 FROM properties WHERE property_type = 'Terreno' AND blacklisted = false AND m2 > 0`
    const avgPricePerM2 =
      await sql`SELECT AVG(price/m2) as avg_price_per_m2 FROM properties WHERE property_type = 'Terreno' AND blacklisted = false AND price > 0 AND m2 > 0`

    const zones = await sql`
      SELECT zone, COUNT(*) as count, AVG(price) as avg_price, AVG(price/m2) as avg_price_per_m2
      FROM properties 
      WHERE property_type = 'Terreno' AND zone IS NOT NULL AND price > 0 AND m2 > 0 AND blacklisted = false
      GROUP BY zone 
      ORDER BY count DESC 
      LIMIT 10
    `

    const soldCount =
      await sql`SELECT COUNT(*) as count FROM properties WHERE property_type = 'Terreno' AND sold = true AND blacklisted = false`

    // Best deals (most below market price)
    const bestDeals = await sql`
      SELECT COUNT(*) as count 
      FROM properties 
      WHERE property_type = 'Terreno' AND price_per_sqm_diff_percent < -10 AND blacklisted = false
    `

    return {
      total: Number.parseInt(totalProperties[0]?.count || "0"),
      avgPrice: Number.parseFloat(avgPrice[0]?.avg_price || "0"),
      avgM2: Number.parseFloat(avgM2[0]?.avg_m2 || "0"),
      avgPricePerM2: Number.parseFloat(avgPricePerM2[0]?.avg_price_per_m2 || "0"),
      zones: Array.isArray(zones) ? zones : [],
      soldCount: Number.parseInt(soldCount[0]?.count || "0"),
      bestDealsCount: Number.parseInt(bestDeals[0]?.count || "0"),
    }
  } catch (error) {
    console.error("Database error in getPropertyStats:", error)
    return {
      total: 0,
      avgPrice: 0,
      avgM2: 0,
      avgPricePerM2: 0,
      zones: [],
      soldCount: 0,
      bestDealsCount: 0,
    }
  }
}

export async function getUniqueValues() {
  if (!sql) {
    console.error("Database connection not available")
    return {
      zones: [],
    }
  }

  try {
    // Only zones for terrenos
    const zones = await sql`
      SELECT DISTINCT zone 
      FROM properties 
      WHERE property_type = 'Terreno' AND zone IS NOT NULL AND blacklisted = false
      ORDER BY zone
    `

    return {
      zones: Array.isArray(zones) ? zones.map((row) => row.zone).filter(Boolean) : [],
    }
  } catch (error) {
    console.error("Database error in getUniqueValues:", error)
    return {
      zones: [],
    }
  }
}
