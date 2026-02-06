import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { brand, creatorProfile } from "@/lib/db/schema";
import { desc, sql, ne, isNotNull, and } from "drizzle-orm";
import { calculateFitAnalysis, type CreatorData, type BrandData } from "@/lib/fit-analysis";

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

    // Get creator profile with all fields needed for fit analysis
    const creatorResult = await db
      .select({
        followers: creatorProfile.followers,
        engagementRate: creatorProfile.engagementRate,
        avgViews: creatorProfile.avgViews,
        avgLikes: creatorProfile.avgLikes,
        contentThemes: creatorProfile.contentThemes,
        subNiches: creatorProfile.subNiches,
        countryCode: creatorProfile.countryCode,
        niche: creatorProfile.niche,
        hasMediaKit: creatorProfile.hasMediaKit,
      })
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

    const creatorData: CreatorData = {
      followers: creator.followers,
      engagementRate: creator.engagementRate ? Number(creator.engagementRate) : null,
      avgViews: creator.avgViews,
      avgLikes: creator.avgLikes,
      contentThemes: creator.contentThemes as string[] | null,
      subNiches: creator.subNiches as string[] | null,
      countryCode: creator.countryCode,
      niche: creator.niche,
      hasMediaKit: creator.hasMediaKit,
    };

    // Get all brands with partnerships, including all fields for fit analysis
    const brands = await db
      .select({
        id: brand.id,
        name: brand.name,
        instagramUsername: brand.instagramUsername,
        profilePicture: brand.profilePicture,
        category: brand.category,
        niche: brand.niche,
        followers: brand.followers,
        partnershipCount: brand.partnershipCount,
        activityScore: brand.activityScore,
        bio: brand.bio,
        isVerifiedAccount: brand.isVerifiedAccount,
        // Fields for fit analysis
        minCreatorFollowers: brand.minCreatorFollowers,
        avgCreatorFollowers: brand.avgCreatorFollowers,
        typicalFollowerMin: brand.typicalFollowerMin,
        typicalFollowerMax: brand.typicalFollowerMax,
        avgPartnerEngagement: brand.avgPartnerEngagement,
        avgPartnerViews: brand.avgPartnerViews,
        contentThemes: brand.contentThemes,
        creatorRegions: brand.creatorRegions,
        lastPartnershipAt: brand.lastPartnershipAt,
        firstPartnershipAt: brand.firstPartnershipAt,
        sponsorshipFrequency: brand.sponsorshipFrequency,
        typicalCreatorNiches: brand.typicalCreatorNiches,
      })
      .from(brand)
      .where(and(isNotNull(brand.partnershipCount), ne(brand.partnershipCount, 0)))
      .orderBy(desc(brand.partnershipCount))
      .limit(100);

    // Calculate real fit analysis for each brand
    const matchedBrands: MatchedBrand[] = brands.map((b) => {
      const brandData: BrandData = {
        minCreatorFollowers: b.minCreatorFollowers,
        avgCreatorFollowers: b.avgCreatorFollowers,
        typicalFollowerMin: b.typicalFollowerMin,
        typicalFollowerMax: b.typicalFollowerMax,
        avgPartnerEngagement: b.avgPartnerEngagement ? Number(b.avgPartnerEngagement) : null,
        avgPartnerViews: b.avgPartnerViews,
        contentThemes: b.contentThemes as string[] | null,
        creatorRegions: b.creatorRegions as string[] | null,
        partnershipCount: b.partnershipCount,
        lastPartnershipAt: b.lastPartnershipAt,
        firstPartnershipAt: b.firstPartnershipAt,
        sponsorshipFrequency: b.sponsorshipFrequency ? Number(b.sponsorshipFrequency) : null,
        isVerifiedAccount: b.isVerifiedAccount,
        typicalCreatorNiches: b.typicalCreatorNiches as string[] | null,
        niche: b.niche,
        category: b.category,
      };

      const analysis = calculateFitAnalysis(creatorData, brandData);

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
        matchScore: analysis.overallScore,
        matchReasons: analysis.strengths.length > 0
          ? analysis.strengths.slice(0, 3)
          : ["Brand sponsors creators on Instagram"],
      };
    });

    // Sort by match score and return top 50
    const sortedMatches = matchedBrands
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 50);

    // Get stats
    const excellentMatches = sortedMatches.filter((m) => m.matchScore >= 80).length;
    const goodMatches = sortedMatches.filter(
      (m) => m.matchScore >= 60 && m.matchScore < 80
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
