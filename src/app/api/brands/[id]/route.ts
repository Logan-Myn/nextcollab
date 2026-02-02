import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { brand, partnership, discoveredCreator } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;

    // Get brand details
    const brandResult = await db
      .select()
      .from(brand)
      .where(eq(brand.id, id))
      .limit(1);

    if (!brandResult[0]) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const brandData = brandResult[0];

    // Get recent partnerships with creator data
    const partnerships = await db
      .select({
        id: partnership.id,
        creatorUsername: partnership.creatorUsername,
        creatorFollowers: partnership.creatorFollowers,
        creatorNiche: partnership.creatorNiche,
        postUrl: partnership.postUrl,
        postType: partnership.postType,
        engagement: partnership.engagement,
        detectedAt: partnership.detectedAt,
        creator: {
          id: discoveredCreator.id,
          fullName: discoveredCreator.fullName,
          bio: discoveredCreator.bio,
          followers: discoveredCreator.followers,
          profilePicture: discoveredCreator.profilePicture,
          isVerified: discoveredCreator.isVerified,
        },
      })
      .from(partnership)
      .leftJoin(
        discoveredCreator,
        eq(partnership.discoveredCreatorId, discoveredCreator.id)
      )
      .where(eq(partnership.brandId, id))
      .orderBy(desc(partnership.detectedAt))
      .limit(20);

    // Calculate some stats
    const totalCollabs = partnerships.length;
    const uniqueCreators = new Set(partnerships.map((p) => p.creatorUsername)).size;
    const avgFollowers =
      partnerships.length > 0
        ? Math.round(
            partnerships.reduce((sum, p) => sum + (p.creatorFollowers || 0), 0) /
              partnerships.length
          )
        : 0;

    return NextResponse.json({
      data: {
        ...brandData,
        stats: {
          totalCollabs,
          uniqueCreators,
          avgCreatorFollowers: avgFollowers,
        },
        recentPartnerships: partnerships,
      },
    });
  } catch (error) {
    console.error("[brands] Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
