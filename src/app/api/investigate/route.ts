import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { investigateTopic } from "@/lib/grounding";

const Schema = z.object({
  topic: z.string().min(3).max(300),
  context: z.string().min(3).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const { topic, context } = parsed.data;
    const result = await investigateTopic(topic, context);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error investigating topic";
    console.error("Error in /api/investigate:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
