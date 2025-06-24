export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getPropertyStats } from "@/lib/database"

export async function GET() {
  try {
    const stats = await getPropertyStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching property stats:", error)
    return NextResponse.json({ error: "Failed to fetch property stats" }, { status: 500 })
  }
}
