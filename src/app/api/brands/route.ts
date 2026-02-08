import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { brand } from "@/lib/db/schema";
import { desc, sql, ilike, or, and, gte, lte, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const activityLevel = searchParams.get("activityLevel");
    const creatorTier = searchParams.get("creatorTier"); // nano, micro, mid, macro, mega
    const sponsorsNiche = searchParams.get("sponsorsNiche"); // filter by typical_creator_niches
    const hasWebsite = searchParams.get("hasWebsite");
    const sortBy = searchParams.get("sortBy") || "partnershipCount";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(brand.name, `%${search}%`),
          ilike(brand.instagramUsername, `%${search}%`),
          ilike(brand.bio, `%${search}%`)
        )
      );
    }

    // Creator tier match - filter by avg_creator_followers range
    if (creatorTier) {
      const tierRanges: Record<string, [number, number]> = {
        nano: [0, 10000],
        micro: [10000, 50000],
        mid: [50000, 100000],
        macro: [100000, 500000],
        mega: [500000, Infinity],
      };
      const range = tierRanges[creatorTier];
      if (range) {
        conditions.push(gte(brand.avgCreatorFollowers, range[0]));
        if (range[1] !== Infinity) {
          conditions.push(lte(brand.avgCreatorFollowers, range[1]));
        }
      }
    }

    // Sponsors niche - filter by typical_creator_niches JSONB array
    if (sponsorsNiche) {
      conditions.push(
        sql`${brand.typicalCreatorNiches} @> ${JSON.stringify([sponsorsNiche])}::jsonb`
      );
    }

    // Has website filter
    if (hasWebsite === "true") {
      conditions.push(eq(brand.hasWebsite, true));
    }

    // Activity level filter based on partnership count
    if (activityLevel === "veryActive") {
      conditions.push(gte(brand.partnershipCount, 5));
    } else if (activityLevel === "active") {
      conditions.push(gte(brand.partnershipCount, 1));
    } else if (activityLevel === "rising") {
      // Rising = 1-3 partnerships (new to sponsoring, less competition)
      conditions.push(gte(brand.partnershipCount, 1));
      conditions.push(lte(brand.partnershipCount, 3));
    }

    // Execute query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(brand)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get brands with sorting
    const orderColumn =
      sortBy === "followers"
        ? brand.followers
        : sortBy === "activityScore"
          ? brand.activityScore
          : sortBy === "name"
            ? brand.name
            : brand.partnershipCount;

    const brands = await db
      .select({
        id: brand.id,
        name: brand.name,
        instagramUsername: brand.instagramUsername,
        category: brand.category,
        niche: brand.niche,
        followers: brand.followers,
        partnershipCount: brand.partnershipCount,
        activityScore: brand.activityScore,
        bio: brand.bio,
        isVerifiedAccount: brand.isVerifiedAccount,
        websiteUrl: brand.websiteUrl,
        hasWebsite: brand.hasWebsite,
        lastPartnershipAt: brand.lastPartnershipAt,
        profilePicture: brand.profilePicture,
        avgCreatorFollowers: brand.avgCreatorFollowers,
        typicalCreatorNiches: brand.typicalCreatorNiches,
      })
      .from(brand)
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? orderColumn : desc(orderColumn!))
      .limit(limit)
      .offset(offset);

    // Get unique creator niches from typical_creator_niches JSONB
    const creatorNichesResult = await db
      .select({
        niche: sql<string>`jsonb_array_elements_text(${brand.typicalCreatorNiches})`,
      })
      .from(brand)
      .where(sql`${brand.typicalCreatorNiches} IS NOT NULL`);
    const creatorNiches = [...new Set(
      creatorNichesResult.map((n) => n.niche).filter(Boolean)
    )] as string[];

    return NextResponse.json({
      data: brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        creatorNiches,
      },
    });
  } catch (error) {
    console.error("[brands] Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
