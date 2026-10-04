import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/validation";
import { analyzeReasoning } from "@/lib/gemini";
import { dbService } from "@/lib/db";
import { getAnonymousId, getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { decision, context, influences } = parsed.data;
    const anonId = await getAnonymousId();
    const user = await getSessionUser();

    // Perform AI reasoning audit via Gemini
    const analysis = await analyzeReasoning(decision, context, influences);

    // Save decision and initial snapshot
    const saved = await dbService.saveDecision({
      title: decision,
      context,
      influences,
      analysis,
      userId: user?.id || null,
      anonymousId: anonId,
    });

    return NextResponse.json({
      success: true,
      decision: saved,
      analysis,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in /api/analyze:", msg);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete reasoning analysis. Please check your inputs and try again.",
      },
      { status: 500 }
    );
  }
}
