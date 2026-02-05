/**
 * Fit Analysis Logic
 *
 * Calculates bidirectional fit between a creator and a brand based on:
 * - Creator similarity (compared to brand's existing partners)
 * - Size match (follower count vs brand's partner range)
 * - Performance match (engagement, views)
 * - Content alignment (themes overlap)
 * - Geographic fit (region alignment)
 * - Activity signal (brand's sponsorship recency and frequency)
 * - Trust signals (verification, media kit, etc.)
 */

export interface CreatorData {
  followers: number | null;
  engagementRate: number | null;
  avgViews: number | null;
  avgLikes: number | null;
  contentThemes: string[] | null;
  subNiches: string[] | null;
  countryCode: string | null;
  niche: string | null;
  hasMediaKit: boolean | null;
  isVerified?: boolean;
}

export interface BrandData {
  minCreatorFollowers: number | null;
  avgCreatorFollowers: number | null;
  typicalFollowerMin: number | null;
  typicalFollowerMax: number | null;
  avgPartnerEngagement: number | null;
  avgPartnerViews: number | null;
  contentThemes: string[] | null;
  creatorRegions: string[] | null;
  partnershipCount: number | null;
  lastPartnershipAt: Date | string | null;
  firstPartnershipAt: Date | string | null;
  sponsorshipFrequency: number | null;
  isVerifiedAccount: boolean | null;
  typicalCreatorNiches: string[] | null;
  niche: string | null;
  category: string | null;
}

export interface FitCategory {
  score: number;
  explanation: string;
  status?: string;
}

export interface FitAnalysis {
  overallScore: number;
  overallStatus: "excellent" | "good" | "fair" | "low";
  creatorSimilarity: FitCategory & {
    similarCreatorCount?: number;
    smallestCreatorSize?: number;
  };
  sizeMatch: FitCategory & {
    status: "below_min" | "in_range" | "above_avg" | "unknown";
  };
  performanceMatch: FitCategory & {
    meetsRequirements: boolean;
  };
  contentAlignment: FitCategory & {
    matchingThemes: string[];
  };
  geographicFit: FitCategory;
  activitySignal: FitCategory & {
    status: "very_active" | "active" | "moderate" | "low" | "unknown";
  };
  trustSignals: FitCategory;
  warnings: string[];
  strengths: string[];
}

/**
 * Calculate the fit analysis between a creator and a brand.
 */
export function calculateFitAnalysis(
  creator: CreatorData,
  brand: BrandData
): FitAnalysis {
  const warnings: string[] = [];
  const strengths: string[] = [];

  // 1. Creator Similarity (20% weight)
  const creatorSimilarity = calculateCreatorSimilarity(creator, brand, strengths, warnings);

  // 2. Size Match (20% weight)
  const sizeMatch = calculateSizeMatch(creator, brand, strengths, warnings);

  // 3. Performance Match (15% weight)
  const performanceMatch = calculatePerformanceMatch(creator, brand, strengths, warnings);

  // 4. Content Alignment (15% weight)
  const contentAlignment = calculateContentAlignment(creator, brand, strengths, warnings);

  // 5. Geographic Fit (10% weight)
  const geographicFit = calculateGeographicFit(creator, brand, strengths, warnings);

  // 6. Activity Signal (15% weight)
  const activitySignal = calculateActivitySignal(brand, strengths, warnings);

  // 7. Trust Signals (5% weight)
  const trustSignals = calculateTrustSignals(creator, brand, strengths, warnings);

  // Calculate weighted overall score
  const overallScore = Math.round(
    creatorSimilarity.score * 0.20 +
    sizeMatch.score * 0.20 +
    performanceMatch.score * 0.15 +
    contentAlignment.score * 0.15 +
    geographicFit.score * 0.10 +
    activitySignal.score * 0.15 +
    trustSignals.score * 0.05
  );

  // Determine overall status
  let overallStatus: FitAnalysis["overallStatus"];
  if (overallScore >= 80) overallStatus = "excellent";
  else if (overallScore >= 60) overallStatus = "good";
  else if (overallScore >= 40) overallStatus = "fair";
  else overallStatus = "low";

  return {
    overallScore,
    overallStatus,
    creatorSimilarity,
    sizeMatch,
    performanceMatch,
    contentAlignment,
    geographicFit,
    activitySignal,
    trustSignals,
    warnings,
    strengths,
  };
}

function calculateCreatorSimilarity(
  creator: CreatorData,
  brand: BrandData,
  strengths: string[],
  warnings: string[]
): FitAnalysis["creatorSimilarity"] {
  let score = 50; // Base score

  // Check niche alignment
  const creatorNiche = creator.niche?.toLowerCase();
  const brandNiches = (brand.typicalCreatorNiches || []).map((n: string) => n.toLowerCase());
  const brandCategory = brand.category?.toLowerCase();
  const brandNiche = brand.niche?.toLowerCase();

  if (creatorNiche) {
    if (
      brandNiches.includes(creatorNiche) ||
      brandCategory === creatorNiche ||
      brandNiche === creatorNiche
    ) {
      score += 40;
      strengths.push(`This brand regularly partners with ${creatorNiche} creators`);
    } else if (brandNiches.some((n) => n.includes(creatorNiche) || creatorNiche.includes(n))) {
      score += 25;
      strengths.push("Related niche to their typical partners");
    }
  }

  // Check partnership count (more partners = more data = more confidence)
  const partnershipCount = brand.partnershipCount || 0;
  if (partnershipCount >= 10) {
    score += 10;
  } else if (partnershipCount >= 5) {
    score += 5;
  } else if (partnershipCount < 3) {
    warnings.push("Limited partnership data available for this brand");
  }

  return {
    score: Math.min(100, score),
    explanation: partnershipCount > 0
      ? `Brand has partnered with ${partnershipCount} creators`
      : "No partnership history available",
    similarCreatorCount: partnershipCount,
    smallestCreatorSize: brand.minCreatorFollowers || undefined,
  };
}

function calculateSizeMatch(
  creator: CreatorData,
  brand: BrandData,
  strengths: string[],
  warnings: string[]
): FitAnalysis["sizeMatch"] {
  const creatorFollowers = creator.followers || 0;
  const minFollowers = brand.minCreatorFollowers;
  const avgFollowers = brand.avgCreatorFollowers;
  const typicalMin = brand.typicalFollowerMin;
  const typicalMax = brand.typicalFollowerMax;

  if (creatorFollowers === 0) {
    return {
      score: 50,
      status: "unknown",
      explanation: "Your follower count is not available",
    };
  }

  // Check against typical range first
  if (typicalMin !== null && typicalMax !== null) {
    if (creatorFollowers >= typicalMin && creatorFollowers <= typicalMax) {
      strengths.push(`Your ${formatNumber(creatorFollowers)} followers fits their typical range`);
      return {
        score: 95,
        status: "in_range",
        explanation: `Your follower count is within their typical partner range (${formatNumber(typicalMin)}-${formatNumber(typicalMax)})`,
      };
    }
  }

  // Check against minimum
  if (minFollowers !== null && creatorFollowers < minFollowers) {
    warnings.push(`This brand typically works with creators who have ${formatNumber(minFollowers)}+ followers`);
    const ratio = creatorFollowers / minFollowers;
    const score = Math.max(20, Math.round(ratio * 70));
    return {
      score,
      status: "below_min",
      explanation: `You're below their smallest partner (${formatNumber(minFollowers)} followers)`,
    };
  }

  // Check against average
  if (avgFollowers !== null && avgFollowers > 0) {
    const ratio = creatorFollowers / avgFollowers;
    if (ratio >= 0.5 && ratio <= 2) {
      strengths.push("Similar follower count to their average partner");
      return {
        score: 85,
        status: "in_range",
        explanation: `Similar to their average partner size (${formatNumber(avgFollowers)} followers)`,
      };
    } else if (ratio > 2) {
      return {
        score: 70,
        status: "above_avg",
        explanation: `You're larger than their average partner (${formatNumber(avgFollowers)} followers)`,
      };
    } else {
      warnings.push("You're smaller than their average partner size");
      return {
        score: 55,
        status: "below_min",
        explanation: `Below their average partner size (${formatNumber(avgFollowers)} followers)`,
      };
    }
  }

  return {
    score: 60,
    status: "unknown",
    explanation: "Insufficient data to determine size fit",
  };
}

function calculatePerformanceMatch(
  creator: CreatorData,
  brand: BrandData,
  strengths: string[],
  warnings: string[]
): FitAnalysis["performanceMatch"] {
  let score = 50;
  let meetsRequirements = false;
  const explanations: string[] = [];

  // Check engagement rate
  const creatorEngagement = creator.engagementRate;
  const brandAvgEngagement = brand.avgPartnerEngagement;

  if (creatorEngagement !== null && brandAvgEngagement !== null) {
    if (creatorEngagement >= brandAvgEngagement) {
      score += 25;
      meetsRequirements = true;
      strengths.push(`Your engagement rate (${creatorEngagement}%) exceeds their partner average`);
      explanations.push(`Engagement: ${creatorEngagement}% vs ${brandAvgEngagement}% avg`);
    } else if (creatorEngagement >= brandAvgEngagement * 0.7) {
      score += 15;
      meetsRequirements = true;
      explanations.push(`Engagement close to partner average`);
    } else {
      warnings.push("Your engagement rate is below their partner average");
      explanations.push(`Lower engagement than partner average`);
    }
  }

  // Check views
  const creatorViews = creator.avgViews;
  const brandAvgViews = brand.avgPartnerViews;

  if (creatorViews !== null && brandAvgViews !== null) {
    if (creatorViews >= brandAvgViews) {
      score += 25;
      meetsRequirements = true;
      strengths.push(`Your average views (${formatNumber(creatorViews)}) exceeds their partner average`);
      explanations.push(`Views: ${formatNumber(creatorViews)} vs ${formatNumber(brandAvgViews)} avg`);
    } else if (creatorViews >= brandAvgViews * 0.5) {
      score += 15;
      explanations.push(`Views in similar range to partners`);
    }
  }

  return {
    score: Math.min(100, score),
    meetsRequirements,
    explanation: explanations.length > 0
      ? explanations.join("; ")
      : "Performance metrics not available for comparison",
  };
}

function calculateContentAlignment(
  creator: CreatorData,
  brand: BrandData,
  strengths: string[],
  warnings: string[]
): FitAnalysis["contentAlignment"] {
  const creatorThemes = creator.contentThemes || [];
  const creatorSubNiches = creator.subNiches || [];
  const brandThemes = brand.contentThemes || [];

  const matchingThemes: string[] = [];

  // Check theme overlap
  for (const theme of creatorThemes) {
    if (brandThemes.some((bt: string) => bt.toLowerCase() === theme.toLowerCase())) {
      matchingThemes.push(theme);
    }
  }

  // Check sub-niche overlap
  for (const niche of creatorSubNiches) {
    if (brandThemes.some((bt: string) =>
      bt.toLowerCase().includes(niche.toLowerCase()) ||
      niche.toLowerCase().includes(bt.toLowerCase())
    )) {
      if (!matchingThemes.includes(niche)) {
        matchingThemes.push(niche);
      }
    }
  }

  let score = 50;
  if (matchingThemes.length >= 3) {
    score = 95;
    strengths.push(`Strong content alignment: ${matchingThemes.slice(0, 3).join(", ")}`);
  } else if (matchingThemes.length >= 2) {
    score = 80;
    strengths.push(`Good content alignment: ${matchingThemes.join(", ")}`);
  } else if (matchingThemes.length === 1) {
    score = 65;
  } else if (creatorThemes.length > 0 && brandThemes.length > 0) {
    score = 40;
    warnings.push("Limited content theme overlap with this brand's partners");
  }

  return {
    score,
    matchingThemes,
    explanation: matchingThemes.length > 0
      ? `Matching themes: ${matchingThemes.join(", ")}`
      : brandThemes.length === 0
        ? "Brand content themes not yet analyzed"
        : "No direct content theme matches",
  };
}

function calculateGeographicFit(
  creator: CreatorData,
  brand: BrandData,
  strengths: string[],
  warnings: string[]
): FitAnalysis["geographicFit"] {
  const creatorCountry = creator.countryCode;
  const brandRegions = brand.creatorRegions || [];

  if (!creatorCountry) {
    return {
      score: 60,
      explanation: "Your location is not available",
    };
  }

  if (brandRegions.length === 0) {
    return {
      score: 60,
      explanation: "Brand's geographic preferences not yet determined",
    };
  }

  if (brandRegions.some((r: string) => r === creatorCountry)) {
    strengths.push(`Brand partners with creators in your region (${creatorCountry})`);
    return {
      score: 95,
      explanation: `They work with creators in ${creatorCountry}`,
    };
  }

  // Check continent/region match
  const creatorContinent = getContinent(creatorCountry);
  const brandContinents = brandRegions.map(getContinent);

  if (creatorContinent && brandContinents.includes(creatorContinent)) {
    return {
      score: 70,
      explanation: `They work with creators in your region (${creatorContinent})`,
    };
  }

  warnings.push("This brand may prefer creators from different regions");
  return {
    score: 40,
    explanation: `Brand typically works with creators from: ${brandRegions.slice(0, 3).join(", ")}`,
  };
}

function calculateActivitySignal(
  brand: BrandData,
  strengths: string[],
  warnings: string[]
): FitAnalysis["activitySignal"] {
  const partnershipCount = brand.partnershipCount || 0;
  const lastPartnershipAt = brand.lastPartnershipAt;
  const frequency = brand.sponsorshipFrequency;

  let score = 50;
  let status: FitAnalysis["activitySignal"]["status"] = "unknown";
  const explanations: string[] = [];

  // Check recency
  if (lastPartnershipAt) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastPartnershipAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince <= 7) {
      score += 25;
      status = "very_active";
      strengths.push("Partnered with creators this week");
      explanations.push("Active this week");
    } else if (daysSince <= 30) {
      score += 20;
      status = "active";
      explanations.push("Active this month");
    } else if (daysSince <= 90) {
      score += 10;
      status = "moderate";
      explanations.push("Active in last 3 months");
    } else {
      status = "low";
      warnings.push("No recent partnership activity detected");
      explanations.push("No recent activity");
    }
  }

  // Check frequency
  if (frequency !== null && frequency > 0) {
    if (frequency >= 4) {
      score += 25;
      if (status !== "very_active") status = "very_active";
      explanations.push(`~${frequency.toFixed(1)} partnerships/month`);
    } else if (frequency >= 2) {
      score += 15;
      if (status === "unknown") status = "active";
      explanations.push(`~${frequency.toFixed(1)} partnerships/month`);
    } else if (frequency >= 0.5) {
      score += 5;
      if (status === "unknown") status = "moderate";
    }
  }

  // Partnership volume
  if (partnershipCount >= 10) {
    score += 10;
    strengths.push(`Extensive partnership history (${partnershipCount} partners)`);
  } else if (partnershipCount < 3) {
    warnings.push("Limited partnership history");
  }

  return {
    score: Math.min(100, score),
    status,
    explanation: explanations.length > 0
      ? explanations.join(", ")
      : "Activity data not available",
  };
}

function calculateTrustSignals(
  creator: CreatorData,
  brand: BrandData,
  strengths: string[],
  _warnings: string[]
): FitAnalysis["trustSignals"] {
  let score = 50;
  const signals: string[] = [];

  // Creator trust signals
  if (creator.hasMediaKit) {
    score += 15;
    signals.push("You have a media kit");
  }

  if (creator.isVerified) {
    score += 10;
    signals.push("You're verified");
  }

  // Brand trust signals
  if (brand.isVerifiedAccount) {
    score += 15;
    strengths.push("Verified brand account");
    signals.push("Brand is verified");
  }

  if ((brand.partnershipCount || 0) >= 5) {
    score += 10;
    signals.push("Established partnership history");
  }

  return {
    score: Math.min(100, score),
    explanation: signals.length > 0
      ? signals.join(", ")
      : "Standard trust profile",
  };
}

// Helper functions
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function getContinent(countryCode: string): string | null {
  const continents: Record<string, string> = {
    // Europe
    FR: "Europe", DE: "Europe", GB: "Europe", IT: "Europe", ES: "Europe",
    NL: "Europe", BE: "Europe", AT: "Europe", CH: "Europe", SE: "Europe",
    NO: "Europe", DK: "Europe", FI: "Europe", PL: "Europe", PT: "Europe",
    IE: "Europe", CZ: "Europe", GR: "Europe", HU: "Europe", RO: "Europe",
    // North America
    US: "North America", CA: "North America", MX: "North America",
    // South America
    BR: "South America", AR: "South America", CO: "South America", CL: "South America",
    // Asia
    JP: "Asia", KR: "Asia", CN: "Asia", IN: "Asia", SG: "Asia",
    TH: "Asia", ID: "Asia", MY: "Asia", PH: "Asia", VN: "Asia",
    // Oceania
    AU: "Oceania", NZ: "Oceania",
    // Middle East
    AE: "Middle East", SA: "Middle East", IL: "Middle East",
    // Africa
    ZA: "Africa", NG: "Africa", EG: "Africa", KE: "Africa",
  };
  return continents[countryCode] || null;
}
