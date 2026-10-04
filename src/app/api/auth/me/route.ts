import { NextResponse } from "next/server";
import { getSessionUser, getAnonymousId } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  const anonId = await getAnonymousId();

  return NextResponse.json({
    authenticated: !!user,
    user,
    anonymousId: anonId,
  });
}
