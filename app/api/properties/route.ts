export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getProperties, type PropertyFilters, type PropertySort } from "@/lib/database"

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

    const sort: PropertySort = {
      field: (searchParams.get("sort_field") as any) || "price_per_sqm_diff_percent",
      direction: (searchParams.get("sort_direction") as any) || "asc",
    }

    const limit = Number.parseInt(searchParams.get("limit") || "24")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const properties = await getProperties(filters, sort, limit, offset)

    return NextResponse.json(Array.isArray(properties) ? properties : [])
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
