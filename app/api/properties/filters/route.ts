export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getUniqueValues } from "@/lib/database"

export async function GET() {
  try {
    const values = await getUniqueValues()
    return NextResponse.json(values)
  } catch (error) {
    console.error("Error fetching filter values:", error)
    return NextResponse.json(
      { error: "Failed to fetch filter values", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
