import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = parseInt(params.id)
    
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      )
    }

    // Update the property to be blacklisted
    const result = await sql`
      UPDATE properties 
      SET blacklisted = true, updated_at = NOW()
      WHERE id = ${propertyId}
      RETURNING id, blacklisted
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Property successfully removed from listings",
      property: result[0]
    })

  } catch (error) {
    console.error("Error blacklisting property:", error)
    return NextResponse.json(
      { error: "Failed to remove property" },
      { status: 500 }
    )
  }
} 