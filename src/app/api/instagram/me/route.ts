import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const [profile] = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("[api/instagram/me] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
