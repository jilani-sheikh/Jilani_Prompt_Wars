import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decision = await dbService.getDecision(id);

    if (!decision) {
      return NextResponse.json(
        { success: false, error: "Decision journey not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error fetching decision";
    console.error("Error in GET /api/decisions/[id]:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
