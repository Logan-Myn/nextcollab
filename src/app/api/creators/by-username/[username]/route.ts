import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { brand, partnership, discoveredCreator } from "@/lib/db/schema";
import { eq, desc, sql, count, countDistinct } from "drizzle-orm";

function getFollowerTier(followers: number): string {
  if (followers >= 1000000) return "mega";
  if (followers >= 500000) return "macro";
  if (followers >= 100000) return "mid";
  if (followers >= 10000) return "micro";
  return "nano";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const db = getDb();
    const { username } = await params;

    // Get creator by Instagram username
    const creatorResult = await db
      .select()
      .from(discoveredCreator)
      .where(eq(discoveredCreator.instagramUsername, username.toLowerCase()))
      .limit(1);

    if (!creatorResult[0]) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const creatorData = creatorResult[0];

    // Get stats from partnership table
    const statsResult = await db
      .select({
        totalCollabs: count(partnership.id),
        uniqueBrands: countDistinct(partnership.brandId),
        avgEngagement: sql<number>`COALESCE(AVG(${partnership.engagement}), 0)`,
        lastCollabAt: sql<string>`MAX(${partnership.detectedAt})`,
      })
      .from(partnership)
      .where(eq(partnership.creatorUsername, creatorData.instagramUsername));

    const stats = statsResult[0] || { totalCollabs: 0, uniqueBrands: 0, avgEngagement: 0, lastCollabAt: null };

    // Calculate engagement rate
    const followers = creatorData.followers || 0;
    const engagementRate = followers > 0 ? (Number(stats.avgEngagement) / followers) * 100 : 0;

    // Get brands this creator has worked with (with brand followers for avg calculation)
    const brandsWorkedWith = await db
      .select({
        brandId: partnership.brandId,
        brandName: brand.name,
        brandUsername: brand.instagramUsername,
        brandLogo: brand.profilePicture,
        brandCategory: brand.category,
        brandFollowers: brand.followers,
        collabCount: count(partnership.id),
        lastCollabAt: sql<string>`MAX(${partnership.detectedAt})`,
        postTypes: sql<string[]>`ARRAY_AGG(DISTINCT ${partnership.postType})`,
      })
      .from(partnership)
      .innerJoin(brand, eq(partnership.brandId, brand.id))
      .where(eq(partnership.creatorUsername, creatorData.instagramUsername))
      .groupBy(partnership.brandId, brand.name, brand.instagramUsername, brand.profilePicture, brand.category, brand.followers)
      .orderBy(sql`MAX(${partnership.detectedAt}) DESC`)
      .limit(20);

    // Calculate average brand size
    const brandFollowers = brandsWorkedWith.map(b => b.brandFollowers || 0).filter(f => f > 0);
    const avgBrandFollowers = brandFollowers.length > 0
      ? Math.round(brandFollowers.reduce((a, b) => a + b, 0) / brandFollowers.length)
      : 0;

    // Get similar creators (same niche, similar follower range)
    const followerMin = Math.floor(followers * 0.5);
    const followerMax = Math.ceil(followers * 2);

    const similarCreators = await db
      .select({
        id: discoveredCreator.id,
        instagramUsername: discoveredCreator.instagramUsername,
        fullName: discoveredCreator.fullName,
        followers: discoveredCreator.followers,
        niche: discoveredCreator.niche,
        profilePicture: discoveredCreator.profilePicture,
        isVerified: discoveredCreator.isVerified,
        partnershipCount: discoveredCreator.partnershipCount,
      })
      .from(discoveredCreator)
      .where(
        sql`${discoveredCreator.id} != ${creatorData.id}
          AND ${discoveredCreator.followers} BETWEEN ${followerMin} AND ${followerMax}
          AND ${discoveredCreator.partnershipCount} > 0
          ${creatorData.niche ? sql`AND ${discoveredCreator.niche} = ${creatorData.niche}` : sql``}`
      )
      .orderBy(desc(discoveredCreator.partnershipCount))
      .limit(6);

    return NextResponse.json({
      data: {
        // Basic profile
        id: creatorData.id,
        instagramUsername: creatorData.instagramUsername,
        fullName: creatorData.fullName,
        bio: creatorData.bio,
        followers: creatorData.followers,
        following: creatorData.following,
        postsCount: creatorData.postsCount,
        isVerified: creatorData.isVerified,
        profilePicture: creatorData.profilePicture,
        niche: creatorData.niche,
        externalUrl: creatorData.externalUrl,

        // Calculated stats
        stats: {
          totalCollabs: Number(stats.totalCollabs) || 0,
          uniqueBrands: Number(stats.uniqueBrands) || 0,
          avgEngagement: Math.round(Number(stats.avgEngagement)) || 0,
          engagementRate: Math.round(engagementRate * 100) / 100,
          followerTier: getFollowerTier(followers),
          lastCollabAt: stats.lastCollabAt,
          avgBrandFollowers,
        },

        // Brand collaborations
        brandsWorkedWith: brandsWorkedWith.map(b => ({
          brandId: b.brandId,
          brandName: b.brandName,
          brandUsername: b.brandUsername,
          brandLogo: b.brandLogo,
          brandCategory: b.brandCategory,
          collabCount: Number(b.collabCount),
          lastCollabAt: b.lastCollabAt,
          postTypes: b.postTypes?.filter(Boolean) || [],
        })),

        // Similar creators
        similarCreators,
      },
    });
  } catch (error) {
    console.error("[creators] Error fetching creator by username:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator" },
      { status: 500 }
    );
  }
}
