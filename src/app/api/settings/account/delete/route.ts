import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { user, session, account, creatorProfile, favorite, match, outreach, savedSearch, pitchTemplate } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const db = getDb();

    // Delete in order respecting foreign keys (cascade handles most, but be explicit)
    await db.delete(outreach).where(eq(outreach.userId, userId));
    await db.delete(pitchTemplate).where(eq(pitchTemplate.userId, userId));
    await db.delete(savedSearch).where(eq(savedSearch.userId, userId));
    await db.delete(match).where(eq(match.userId, userId));
    await db.delete(favorite).where(eq(favorite.userId, userId));
    await db.delete(creatorProfile).where(eq(creatorProfile.userId, userId));
    await db.delete(session).where(eq(session.userId, userId));
    await db.delete(account).where(eq(account.userId, userId));
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/settings/account/delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
