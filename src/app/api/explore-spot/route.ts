import { NextRequest, NextResponse } from "next/server";
import { ExploreSpotRequestSchema } from "@/lib/validation";
import { exploreBlindSpotDetail } from "@/lib/gemini";
import { investigateTopic } from "@/lib/grounding";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExploreSpotRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { decisionTitle, decisionContext, userInfluences, spot, action } = parsed.data;

    // Run focused AI probe on this blind spot
    const result = await exploreBlindSpotDetail(
      decisionTitle,
      decisionContext,
      userInfluences,
      spot,
      action
    );

    // If user chose "investigate", perform Google Grounding / Search evidence synthesis
    if (action === "investigate") {
      const topic = `${spot.title}: ${spot.description}`;
      const searchContext = `${decisionTitle} - ${decisionContext}`;
      const grounded = await investigateTopic(topic, searchContext);
      result.groundedEvidence = {
        summary: grounded.summary,
        sources: grounded.sources,
      };
      if (grounded.verificationCriteria) {
        result.actionableSteps = [
          ...result.actionableSteps,
          ...grounded.verificationCriteria,
        ];
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in /api/explore-spot:", msg);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to explore blind spot. Please try again.",
      },
      { status: 500 }
    );
  }
}
