import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { brand, partnership, discoveredCreator } from "@/lib/db/schema";
import { eq, desc, and, ne, isNotNull, sql, count, countDistinct, avg } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const db = getDb();
    const { username } = await params;

    // Get brand by Instagram username
    const brandResult = await db
      .select()
      .from(brand)
      .where(eq(brand.instagramUsername, username.toLowerCase()))
      .limit(1);

    if (!brandResult[0]) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const brandData = brandResult[0];

    // Get ACCURATE stats with separate query (not limited by sample size)
    const statsResult = await db
      .select({
        totalCollabs: count(partnership.id),
        uniqueCreators: countDistinct(partnership.creatorUsername),
        avgFollowers: avg(partnership.creatorFollowers),
        lastCollabAt: sql<string>`MAX(${partnership.detectedAt})`,
      })
      .from(partnership)
      .where(eq(partnership.brandId, brandData.id));

    const stats = statsResult[0] || { totalCollabs: 0, uniqueCreators: 0, avgFollowers: 0, lastCollabAt: null };

    // Get partnerships AGGREGATED by unique creator (not per-post)
    const aggregatedCreators = await db
      .select({
        creatorUsername: partnership.creatorUsername,
        creatorFollowers: sql<number>`MAX(${partnership.creatorFollowers})`.as('creatorFollowers'),
        creatorNiche: sql<string>`MAX(${partnership.creatorNiche})`.as('creatorNiche'),
        collabCount: count(partnership.id).as('collabCount'),
        totalEngagement: sql<number>`COALESCE(SUM(${partnership.engagement}), 0)`.as('totalEngagement'),
        avgEngagement: sql<number>`COALESCE(AVG(${partnership.engagement}), 0)`.as('avgEngagement'),
        lastCollabAt: sql<string>`MAX(${partnership.detectedAt})`.as('lastCollabAt'),
        postTypes: sql<string[]>`ARRAY_AGG(DISTINCT ${partnership.postType})`.as('postTypes'),
        postUrls: sql<string[]>`ARRAY_AGG(${partnership.postUrl} ORDER BY ${partnership.detectedAt} DESC)`.as('postUrls'),
      })
      .from(partnership)
      .where(eq(partnership.brandId, brandData.id))
      .groupBy(partnership.creatorUsername)
      .orderBy(sql`MAX(${partnership.detectedAt}) DESC`)
      .limit(30);

    // Get latest posts with images for preview section
    const latestPosts = await db
      .select({
        postUrl: partnership.postUrl,
        displayUrl: partnership.displayUrl,
        postType: partnership.postType,
        creatorUsername: partnership.creatorUsername,
        detectedAt: partnership.detectedAt,
      })
      .from(partnership)
      .where(
        and(
          eq(partnership.brandId, brandData.id),
          isNotNull(partnership.displayUrl)
        )
      )
      .orderBy(desc(partnership.detectedAt))
      .limit(4);

    // Fetch creator details for each aggregated creator
    const creatorUsernames = aggregatedCreators
      .map(c => c.creatorUsername)
      .filter((u): u is string => u !== null);

    const creatorDetails = creatorUsernames.length > 0
      ? await db
          .select({
            instagramUsername: discoveredCreator.instagramUsername,
            id: discoveredCreator.id,
            fullName: discoveredCreator.fullName,
            bio: discoveredCreator.bio,
            followers: discoveredCreator.followers,
            profilePicture: discoveredCreator.profilePicture,
            isVerified: discoveredCreator.isVerified,
          })
          .from(discoveredCreator)
          .where(sql`${discoveredCreator.instagramUsername} IN (${sql.join(creatorUsernames.map(u => sql`${u}`), sql`, `)})`)
      : [];

    // Create lookup map for creator details
    const creatorMap = new Map(creatorDetails.map(c => [c.instagramUsername, c]));

    // Combine aggregated data with creator details
    const collabs = aggregatedCreators.map(agg => {
      const creator = agg.creatorUsername ? creatorMap.get(agg.creatorUsername) : null;
      const followers = creator?.followers || agg.creatorFollowers || 0;
      const engagementRate = followers > 0 ? ((agg.avgEngagement || 0) / followers) * 100 : 0;

      return {
        creatorUsername: agg.creatorUsername,
        creatorFollowers: followers,
        creatorNiche: agg.creatorNiche,
        collabCount: Number(agg.collabCount),
        totalEngagement: Number(agg.totalEngagement),
        avgEngagement: Math.round(Number(agg.avgEngagement)),
        engagementRate: Math.round(engagementRate * 100) / 100, // 2 decimal places
        lastCollabAt: agg.lastCollabAt,
        postTypes: agg.postTypes,
        postUrls: agg.postUrls,
        creator: creator ? {
          id: creator.id,
          fullName: creator.fullName,
          bio: creator.bio,
          followers: creator.followers,
          profilePicture: creator.profilePicture,
          isVerified: creator.isVerified,
        } : null,
      };
    });

    // Get similar brands (same category/niche, excluding current)
    const similarBrands = await db
      .select({
        id: brand.id,
        name: brand.name,
        instagramUsername: brand.instagramUsername,
        category: brand.category,
        niche: brand.niche,
        followers: brand.followers,
        partnershipCount: brand.partnershipCount,
        isVerifiedAccount: brand.isVerifiedAccount,
        profilePicture: brand.profilePicture,
      })
      .from(brand)
      .where(
        and(
          ne(brand.id, brandData.id),
          isNotNull(brand.partnershipCount),
          ne(brand.partnershipCount, 0),
          brandData.category
            ? eq(brand.category, brandData.category)
            : brandData.niche
              ? eq(brand.niche, brandData.niche)
              : sql`true`
        )
      )
      .orderBy(desc(brand.partnershipCount))
      .limit(6);

    return NextResponse.json({
      data: {
        ...brandData,
        stats: {
          totalCollabs: Number(stats.totalCollabs) || 0,
          uniqueCreators: Number(stats.uniqueCreators) || 0,
          avgCreatorFollowers: Math.round(Number(stats.avgFollowers) || 0),
          lastCollabAt: stats.lastCollabAt,
        },
        collabs, // Aggregated by unique creator
        similarBrands,
        latestPosts,
      },
    });
  } catch (error) {
    console.error("[brands] Error fetching brand by username:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
