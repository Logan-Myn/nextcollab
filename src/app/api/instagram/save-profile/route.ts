import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profile } = body;

    if (!userId || !profile?.username) {
      return NextResponse.json(
        { error: "userId and profile are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if profile already exists for this user
    const existing = await db
      .select()
      .from(creatorProfile)
      .where(eq(creatorProfile.userId, userId))
      .limit(1);

    const profileData = {
      instagramUsername: profile.username,
      followers: profile.followers || 0,
      engagementRate: profile.engagementRate?.toString() || null,
      niche: profile.niche || null,
      bio: profile.bio || null,
      profilePicture: profile.profilePicture || null,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      // Update existing profile
      await db
        .update(creatorProfile)
        .set(profileData)
        .where(eq(creatorProfile.userId, userId));

      return NextResponse.json({
        data: { id: existing[0].id, ...profileData },
      });
    } else {
      // Insert new profile
      const [inserted] = await db
        .insert(creatorProfile)
        .values({
          userId,
          ...profileData,
          createdAt: new Date(),
        })
        .returning();

      return NextResponse.json({ data: inserted });
    }
  } catch (error) {
    console.error("[api/instagram/save-profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
