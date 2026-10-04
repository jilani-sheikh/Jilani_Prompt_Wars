import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setSessionUser, getAnonymousId } from "@/lib/session";
import { dbService } from "@/lib/db";

const GoogleAuthSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).default("Anonymous Thinker"),
  avatarUrl: z.string().optional(),
  decisionIdToAssociate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GoogleAuthSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid Google user data" },
        { status: 400 }
      );
    }

    const { email, name, avatarUrl, decisionIdToAssociate } = parsed.data;
    const userId = "usr_" + email.replace(/[^a-zA-Z0-9]/g, "_");

    const user = {
      id: userId,
      email,
      name,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    };

    await setSessionUser(user);

    if (decisionIdToAssociate) {
      await dbService.associateUser(decisionIdToAssociate, email, name);
    } else {
      // Transfer any anonymous decisions to this user
      const anonId = await getAnonymousId();
      const anonDecisions = await dbService.getUserDecisions(anonId);
      for (const dec of anonDecisions) {
        await dbService.associateUser(dec.id, email, name);
      }
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Authentication error";
    console.error("Error in /api/auth/google:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
