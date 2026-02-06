import { NextRequest, NextResponse, after } from "next/server";
import { getDb } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const XPOZ_SERVICE_URL = process.env.XPOZ_SERVICE_URL || "http://localhost:3001";

interface EnrichedProfile {
  username: string;
  followers: number;
  bio: string | null;
  profilePicture: string | null;
  isVerified: boolean;
  avgViews: number | null;
  avgLikes: number | null;
  avgComments: number | null;
  engagementRate: number | null;
  postFrequency: number | null;
  viewToFollowerRatio: number | null;
  postTypeMix: { reels: number; images: number; carousels: number } | null;
  postsAnalyzed: number | null;
  contentThemes: string[] | null;
  subNiches: string[] | null;
  primaryLanguage: string | null;
  locationDisplay: string | null;
  countryCode: string | null;
}

/**
 * Try to enrich the profile with metrics and AI-extracted themes.
 * Falls back gracefully if enrichment fails.
 */
async function enrichProfile(username: string): Promise<EnrichedProfile | null> {
  try {
    const response = await fetch(`${XPOZ_SERVICE_URL}/profile/enrich`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      console.error(`[save-profile] Enrichment failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data as EnrichedProfile;
  } catch (error) {
    console.error("[save-profile] Enrichment error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profile, enrich = false } = body;

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

    // Build base profile data from provided profile
    const profileData: Record<string, unknown> = {
      instagramUsername: profile.username,
      followers: profile.followers || 0,
      engagementRate: profile.engagementRate?.toString() || null,
      niche: profile.niche || null,
      bio: profile.bio || null,
      profilePicture: profile.profilePicture || null,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    };

    // Save basic profile immediately (fast)
    let savedId: string;
    if (existing.length > 0) {
      await db
        .update(creatorProfile)
        .set(profileData)
        .where(eq(creatorProfile.userId, userId));
      savedId = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(creatorProfile)
        .values({
          userId,
          ...profileData,
          createdAt: new Date(),
        })
        .returning();
      savedId = inserted.id;
    }

    // Run enrichment in the background after the response is sent
    if (enrich) {
      after(async () => {
        try {
          console.log(`[save-profile] Background enrichment starting for @${profile.username}...`);
          const enriched = await enrichProfile(profile.username);

          if (enriched) {
            const enrichedData: Record<string, unknown> = {
              followers: enriched.followers,
              bio: enriched.bio,
              profilePicture: enriched.profilePicture,
              engagementRate: enriched.engagementRate?.toString() || null,
              avgViews: enriched.avgViews,
              avgLikes: enriched.avgLikes,
              avgComments: enriched.avgComments,
              postFrequency: enriched.postFrequency?.toString() || null,
              viewToFollowerRatio: enriched.viewToFollowerRatio?.toString() || null,
              contentThemes: enriched.contentThemes ? JSON.stringify(enriched.contentThemes) : null,
              subNiches: enriched.subNiches ? JSON.stringify(enriched.subNiches) : null,
              postTypeMix: enriched.postTypeMix ? JSON.stringify(enriched.postTypeMix) : null,
              primaryLanguage: enriched.primaryLanguage,
              locationDisplay: enriched.locationDisplay,
              countryCode: enriched.countryCode,
              postsAnalyzed: enriched.postsAnalyzed,
              enrichedAt: new Date(),
              enrichmentVersion: 1,
              updatedAt: new Date(),
            };

            // Use AI-extracted contentThemes as niche
            if (enriched.contentThemes && enriched.contentThemes.length > 0) {
              enrichedData.niche = enriched.contentThemes[0];
            }

            const db = getDb();
            await db
              .update(creatorProfile)
              .set(enrichedData)
              .where(eq(creatorProfile.userId, userId));

            console.log(`[save-profile] Background enrichment complete for @${profile.username}: niche=${enrichedData.niche}`);
          }
        } catch (error) {
          console.error(`[save-profile] Background enrichment failed for @${profile.username}:`, error);
        }
      });
    }

    return NextResponse.json({
      data: { id: savedId, ...profileData },
      enriching: enrich,
    });
  } catch (error) {
    console.error("[api/instagram/save-profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
