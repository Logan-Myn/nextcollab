import { NextRequest, NextResponse } from "next/server";
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

    // If enrichment is requested, fetch enriched data
    if (enrich) {
      console.log(`[save-profile] Enriching profile for @${profile.username}...`);
      const enriched = await enrichProfile(profile.username);

      if (enriched) {
        // Override base data with enriched data
        profileData.followers = enriched.followers;
        profileData.bio = enriched.bio;
        profileData.profilePicture = enriched.profilePicture;
        profileData.engagementRate = enriched.engagementRate?.toString() || null;

        // Use AI-extracted contentThemes as niche (much more accurate than keyword detection)
        if (enriched.contentThemes && enriched.contentThemes.length > 0) {
          profileData.niche = enriched.contentThemes[0];
        }

        // Add enriched metrics
        profileData.avgViews = enriched.avgViews;
        profileData.avgLikes = enriched.avgLikes;
        profileData.avgComments = enriched.avgComments;
        profileData.postFrequency = enriched.postFrequency?.toString() || null;
        profileData.viewToFollowerRatio = enriched.viewToFollowerRatio?.toString() || null;
        profileData.contentThemes = enriched.contentThemes ? JSON.stringify(enriched.contentThemes) : null;
        profileData.subNiches = enriched.subNiches ? JSON.stringify(enriched.subNiches) : null;
        profileData.postTypeMix = enriched.postTypeMix ? JSON.stringify(enriched.postTypeMix) : null;
        profileData.primaryLanguage = enriched.primaryLanguage;
        profileData.locationDisplay = enriched.locationDisplay;
        profileData.countryCode = enriched.countryCode;
        profileData.postsAnalyzed = enriched.postsAnalyzed;
        profileData.enrichedAt = new Date();
        profileData.enrichmentVersion = 1;

        console.log(`[save-profile] Enrichment complete for @${profile.username}: niche=${profileData.niche}`);
      }
    }

    if (existing.length > 0) {
      // Update existing profile
      await db
        .update(creatorProfile)
        .set(profileData)
        .where(eq(creatorProfile.userId, userId));

      return NextResponse.json({
        data: { id: existing[0].id, ...profileData },
        enriched: enrich,
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

      return NextResponse.json({ data: inserted, enriched: enrich });
    }
  } catch (error) {
    console.error("[api/instagram/save-profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
