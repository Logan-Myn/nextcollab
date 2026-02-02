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
    const category = searchParams.get("category");
    const niche = searchParams.get("niche");
    const minFollowers = searchParams.get("minFollowers");
    const maxFollowers = searchParams.get("maxFollowers");
    const verified = searchParams.get("verified");
    const activityLevel = searchParams.get("activityLevel");
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

    if (category) {
      conditions.push(eq(brand.category, category));
    }

    if (niche) {
      conditions.push(eq(brand.niche, niche));
    }

    if (minFollowers) {
      conditions.push(gte(brand.followers, parseInt(minFollowers)));
    }

    if (maxFollowers) {
      conditions.push(lte(brand.followers, parseInt(maxFollowers)));
    }

    if (verified === "true") {
      conditions.push(eq(brand.isVerifiedAccount, true));
    }

    // Activity level filter based on partnership count
    if (activityLevel === "veryActive") {
      conditions.push(gte(brand.partnershipCount, 5));
    } else if (activityLevel === "active") {
      conditions.push(gte(brand.partnershipCount, 1));
      conditions.push(lte(brand.partnershipCount, 4));
    } else if (activityLevel === "quiet") {
      conditions.push(
        or(eq(brand.partnershipCount, 0), sql`${brand.partnershipCount} IS NULL`)
      );
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
        lastPartnershipAt: brand.lastPartnershipAt,
      })
      .from(brand)
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? orderColumn : desc(orderColumn!))
      .limit(limit)
      .offset(offset);

    // Get unique categories for filters
    const categoriesResult = await db
      .selectDistinct({ category: brand.category })
      .from(brand)
      .where(sql`${brand.category} IS NOT NULL`);
    const categories = categoriesResult
      .map((c) => c.category)
      .filter(Boolean) as string[];

    // Get unique niches for filters
    const nichesResult = await db
      .selectDistinct({ niche: brand.niche })
      .from(brand)
      .where(sql`${brand.niche} IS NOT NULL`);
    const niches = nichesResult
      .map((n) => n.niche)
      .filter(Boolean) as string[];

    return NextResponse.json({
      data: brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        categories,
        niches,
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
