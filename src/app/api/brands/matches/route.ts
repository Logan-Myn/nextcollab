import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { brand, creatorProfile } from "@/lib/db/schema";
import { desc, sql, ne, isNotNull, and } from "drizzle-orm";

interface MatchedBrand {
  id: string;
  name: string;
  instagramUsername: string | null;
  profilePicture: string | null;
  category: string | null;
  niche: string | null;
  followers: number | null;
  partnershipCount: number | null;
  activityScore: number | null;
  bio: string | null;
  isVerifiedAccount: boolean | null;
  matchScore: number;
  matchReasons: string[];
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get creator profile
    const creatorResult = await db
      .select()
      .from(creatorProfile)
      .where(sql`${creatorProfile.userId} = ${userId}`)
      .limit(1);

    const creator = creatorResult[0];

    if (!creator) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 404 }
      );
    }

    // Get all brands with partnerships (active brands)
    const brands = await db
      .select({
        id: brand.id,
        name: brand.name,
        instagramUsername: brand.instagramUsername,
        profilePicture: brand.profilePicture,
        category: brand.category,
        niche: brand.niche,
        followers: brand.followers,
        following: brand.following,
        partnershipCount: brand.partnershipCount,
        activityScore: brand.activityScore,
        bio: brand.bio,
        isVerifiedAccount: brand.isVerifiedAccount,
        typicalFollowerMin: brand.typicalFollowerMin,
        typicalFollowerMax: brand.typicalFollowerMax,
        avgCreatorFollowers: brand.avgCreatorFollowers,
        typicalCreatorNiches: brand.typicalCreatorNiches,
        lastPartnershipAt: brand.lastPartnershipAt,
      })
      .from(brand)
      .where(and(isNotNull(brand.partnershipCount), ne(brand.partnershipCount, 0)))
      .orderBy(desc(brand.partnershipCount))
      .limit(100);

    // Calculate match scores
    const matchedBrands: MatchedBrand[] = brands.map((b) => {
      const reasons: string[] = [];
      let score = 50; // Base score

      // 1. Niche alignment (30% weight)
      const creatorNiche = creator.niche?.toLowerCase();
      const brandCategory = b.category?.toLowerCase();
      const brandNiche = b.niche?.toLowerCase();
      const brandNiches = Array.isArray(b.typicalCreatorNiches)
        ? (b.typicalCreatorNiches as string[]).map((n) => n.toLowerCase())
        : [];

      if (creatorNiche) {
        if (
          brandCategory === creatorNiche ||
          brandNiche === creatorNiche ||
          brandNiches.includes(creatorNiche)
        ) {
          score += 25;
          reasons.push(`Partners with ${creatorNiche} creators`);
        } else if (
          brandNiches.some(
            (n) => n.includes(creatorNiche) || creatorNiche.includes(n)
          )
        ) {
          score += 15;
          reasons.push("Related niche alignment");
        }
      }

      // 2. Follower range fit (25% weight)
      const creatorFollowers = creator.followers || 0;
      const avgCreatorFollowers = b.avgCreatorFollowers || 0;
      const typicalMin = b.typicalFollowerMin || 0;
      const typicalMax = b.typicalFollowerMax || Infinity;

      if (creatorFollowers >= typicalMin && creatorFollowers <= typicalMax) {
        score += 20;
        reasons.push("Your follower count fits their typical range");
      } else if (avgCreatorFollowers > 0) {
        const ratio = creatorFollowers / avgCreatorFollowers;
        if (ratio >= 0.5 && ratio <= 2) {
          score += 15;
          reasons.push("Similar creator size to their partners");
        } else if (ratio >= 0.2 && ratio <= 5) {
          score += 8;
        }
      }

      // 3. Activity score (15% weight)
      const partnershipCount = b.partnershipCount || 0;
      if (partnershipCount >= 5) {
        score += 12;
        reasons.push(`Very active (${partnershipCount} recent partnerships)`);
      } else if (partnershipCount >= 2) {
        score += 8;
        reasons.push(`Active (${partnershipCount} recent partnerships)`);
      } else if (partnershipCount >= 1) {
        score += 4;
      }

      // 4. Recency bonus (10% weight)
      if (b.lastPartnershipAt) {
        const daysSince = Math.floor(
          (Date.now() - new Date(b.lastPartnershipAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSince <= 7) {
          score += 8;
          reasons.push("Partnered with creators this week");
        } else if (daysSince <= 30) {
          score += 5;
          reasons.push("Partnered with creators this month");
        }
      }

      // 5. Verified brand bonus
      if (b.isVerifiedAccount) {
        score += 3;
      }

      // Cap at 100
      score = Math.min(score, 100);

      // Ensure at least one reason
      if (reasons.length === 0) {
        reasons.push("Brand sponsors creators on Instagram");
      }

      return {
        id: b.id,
        name: b.name,
        instagramUsername: b.instagramUsername,
        profilePicture: b.profilePicture,
        category: b.category,
        niche: b.niche,
        followers: b.followers,
        partnershipCount: b.partnershipCount,
        activityScore: b.activityScore,
        bio: b.bio,
        isVerifiedAccount: b.isVerifiedAccount,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    // Sort by match score and return top 50
    const sortedMatches = matchedBrands
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 50);

    // Get stats
    const excellentMatches = sortedMatches.filter((m) => m.matchScore >= 85).length;
    const goodMatches = sortedMatches.filter(
      (m) => m.matchScore >= 70 && m.matchScore < 85
    ).length;

    return NextResponse.json({
      data: sortedMatches,
      stats: {
        total: sortedMatches.length,
        excellent: excellentMatches,
        good: goodMatches,
        creatorNiche: creator.niche,
        creatorFollowers: creator.followers,
      },
    });
  } catch (error) {
    console.error("[brands] Error calculating matches:", error);
    return NextResponse.json(
      { error: "Failed to calculate matches" },
      { status: 500 }
    );
  }
}
