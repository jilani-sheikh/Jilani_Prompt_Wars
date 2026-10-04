import { NextRequest, NextResponse } from "next/server";
import { ReflectionRequestSchema } from "@/lib/validation";
import { dbService } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: decisionId } = await params;
    const body = await req.json();
    const parsed = ReflectionRequestSchema.safeParse({ ...body, decisionId });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userNote, updatedReasoning, exploredSpots } = parsed.data;

    const reflection = await dbService.addReflection({
      decisionId,
      userNote,
      updatedReasoning,
      exploredSpots,
    });

    if (!reflection) {
      return NextResponse.json(
        { success: false, error: "Decision not found" },
        { status: 404 }
      );
    }

    const updatedDecision = await dbService.getDecision(decisionId);

    return NextResponse.json({
      success: true,
      reflection,
      decision: updatedDecision,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error saving reflection";
    console.error("Error in /api/decisions/[id]/reflect:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
