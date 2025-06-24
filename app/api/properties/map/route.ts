export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getPropertiesForMap, type PropertyFilters } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: PropertyFilters = {
      search: searchParams.get("search") || undefined,
      zone: searchParams.get("zone") === "all" ? undefined : searchParams.get("zone") || undefined,
      min_price: searchParams.get("min_price") ? Number.parseInt(searchParams.get("min_price")!) : undefined,
      max_price: searchParams.get("max_price") ? Number.parseInt(searchParams.get("max_price")!) : undefined,
      min_m2: searchParams.get("min_m2") ? Number.parseInt(searchParams.get("min_m2")!) : undefined,
      max_m2: searchParams.get("max_m2") ? Number.parseInt(searchParams.get("max_m2")!) : undefined,
      sold: searchParams.get("sold") ? searchParams.get("sold") === "true" : undefined,
    }

    const limit = Number.parseInt(searchParams.get("limit") || "200")
    const properties = await getPropertiesForMap(filters, limit)

    return NextResponse.json(Array.isArray(properties) ? properties : [])
  } catch (error) {
    console.error("Error fetching map properties:", error)
    return NextResponse.json(
      { error: "Failed to fetch map properties", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
