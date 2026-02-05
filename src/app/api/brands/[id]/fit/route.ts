import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { brand, creatorProfile } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { calculateFitAnalysis, type CreatorData, type BrandData } from "@/lib/fit-analysis";

/**
 * GET /api/brands/[id]/fit?userId=xxx
 *
 * Calculate fit analysis between a creator and a brand.
 * Returns detailed fit scores across 7 categories plus an overall score.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const params = await context.params;
    const brandId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get creator profile with enriched data
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

    // Get brand with enriched data
    const brandResult = await db
      .select({
        id: brand.id,
        name: brand.name,
        instagramUsername: brand.instagramUsername,
        minCreatorFollowers: brand.minCreatorFollowers,
        avgCreatorFollowers: brand.avgCreatorFollowers,
        typicalFollowerMin: brand.typicalFollowerMin,
        typicalFollowerMax: brand.typicalFollowerMax,
        avgPartnerEngagement: brand.avgPartnerEngagement,
        avgPartnerViews: brand.avgPartnerViews,
        contentThemes: brand.contentThemes,
        creatorRegions: brand.creatorRegions,
        partnershipCount: brand.partnershipCount,
        lastPartnershipAt: brand.lastPartnershipAt,
        firstPartnershipAt: brand.firstPartnershipAt,
        sponsorshipFrequency: brand.sponsorshipFrequency,
        isVerifiedAccount: brand.isVerifiedAccount,
        typicalCreatorNiches: brand.typicalCreatorNiches,
        niche: brand.niche,
        category: brand.category,
      })
      .from(brand)
      .where(sql`${brand.id} = ${brandId}`)
      .limit(1);

    const brandData = brandResult[0];

    if (!brandData) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Transform to fit analysis types
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

    const brandFitData: BrandData = {
      minCreatorFollowers: brandData.minCreatorFollowers,
      avgCreatorFollowers: brandData.avgCreatorFollowers,
      typicalFollowerMin: brandData.typicalFollowerMin,
      typicalFollowerMax: brandData.typicalFollowerMax,
      avgPartnerEngagement: brandData.avgPartnerEngagement ? Number(brandData.avgPartnerEngagement) : null,
      avgPartnerViews: brandData.avgPartnerViews,
      contentThemes: brandData.contentThemes as string[] | null,
      creatorRegions: brandData.creatorRegions as string[] | null,
      partnershipCount: brandData.partnershipCount,
      lastPartnershipAt: brandData.lastPartnershipAt,
      firstPartnershipAt: brandData.firstPartnershipAt,
      sponsorshipFrequency: brandData.sponsorshipFrequency ? Number(brandData.sponsorshipFrequency) : null,
      isVerifiedAccount: brandData.isVerifiedAccount,
      typicalCreatorNiches: brandData.typicalCreatorNiches as string[] | null,
      niche: brandData.niche,
      category: brandData.category,
    };

    // Calculate fit analysis
    const fitAnalysis = calculateFitAnalysis(creatorData, brandFitData);

    return NextResponse.json({
      data: {
        brandId: brandData.id,
        brandName: brandData.name,
        brandUsername: brandData.instagramUsername,
        ...fitAnalysis,
        // Include raw stats for debugging/display
        creatorStats: {
          followers: creator.followers,
          engagementRate: creator.engagementRate ? Number(creator.engagementRate) : null,
          avgViews: creator.avgViews,
          contentThemes: creator.contentThemes,
          countryCode: creator.countryCode,
        },
        brandStats: {
          partnershipCount: brandData.partnershipCount,
          avgCreatorFollowers: brandData.avgCreatorFollowers,
          minCreatorFollowers: brandData.minCreatorFollowers,
          avgPartnerEngagement: brandData.avgPartnerEngagement ? Number(brandData.avgPartnerEngagement) : null,
          avgPartnerViews: brandData.avgPartnerViews,
          creatorRegions: brandData.creatorRegions,
          contentThemes: brandData.contentThemes,
        },
      },
    });
  } catch (error) {
    console.error("[brands] Error calculating fit analysis:", error);
    return NextResponse.json(
      { error: "Failed to calculate fit analysis" },
      { status: 500 }
    );
  }
}
