import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { getAnonymousId, getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    const anonId = await getAnonymousId();

    const idToSearch = user?.id || anonId;
    const decisions = await dbService.getUserDecisions(idToSearch);

    return NextResponse.json({
      success: true,
      decisions,
      user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error fetching decisions";
    console.error("Error in GET /api/decisions:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
