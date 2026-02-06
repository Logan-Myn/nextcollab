import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profile, forceReset } = body;

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

    let savedId: string;

    if (existing.length > 0) {
      const usernameChanged =
        forceReset ||
        existing[0].instagramUsername?.toLowerCase() !== profile.username.toLowerCase();

      const updateData: Record<string, unknown> = {
        instagramUsername: profile.username,
        updatedAt: new Date(),
      };

      // If username changed, wipe all enriched data so SSE re-triggers
      if (usernameChanged) {
        updateData.followers = 0;
        updateData.bio = null;
        updateData.profilePicture = null;
        updateData.niche = null;
        updateData.engagementRate = null;
        updateData.avgViews = null;
        updateData.avgLikes = null;
        updateData.avgComments = null;
        updateData.postFrequency = null;
        updateData.viewToFollowerRatio = null;
        updateData.contentThemes = null;
        updateData.subNiches = null;
        updateData.postTypeMix = null;
        updateData.primaryLanguage = null;
        updateData.locationDisplay = null;
        updateData.countryCode = null;
        updateData.postsAnalyzed = null;
        updateData.enrichedAt = null;
        updateData.enrichmentVersion = null;
      } else {
        // Same username — only set fields if explicitly provided
        if (profile.followers != null) updateData.followers = profile.followers;
        if (profile.bio != null) updateData.bio = profile.bio;
        if (profile.profilePicture != null) updateData.profilePicture = profile.profilePicture;
        if (profile.niche != null) updateData.niche = profile.niche;
        if (profile.engagementRate != null) updateData.engagementRate = profile.engagementRate.toString();
      }

      await db
        .update(creatorProfile)
        .set(updateData)
        .where(eq(creatorProfile.userId, userId));
      savedId = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(creatorProfile)
        .values({
          userId,
          instagramUsername: profile.username,
          followers: profile.followers || 0,
          engagementRate: profile.engagementRate?.toString() || null,
          niche: profile.niche || null,
          bio: profile.bio || null,
          profilePicture: profile.profilePicture || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      savedId = inserted.id;
    }

    return NextResponse.json({
      data: { id: savedId, instagramUsername: profile.username },
    });
  } catch (error) {
    console.error("[api/instagram/save-profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
