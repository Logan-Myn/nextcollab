"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useSession } from "@/lib/auth-client";
import { useEnrichmentStream } from "@/hooks/use-enrichment-stream";
import type { ProfileData, MetricsData, AiData } from "@/hooks/use-enrichment-stream";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  Share2,
  Globe,
  CheckCircle2,
  Loader2,
  Instagram,
  Sparkles,
  ChevronRight,
  Building2,
  Zap,
  LayoutGrid,
  Handshake,
  Users,
  TrendingUp,
  Eye,
  Heart,
  BarChart3,
  MapPin,
  Languages,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { TextAnimate } from "@/components/ui/text-animate";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Particles } from "@/components/ui/particles";

// ============================================
// Types
// ============================================

interface BrandWorkedWith {
  brandId: string;
  brandName: string;
  brandUsername: string | null;
  brandLogo: string | null;
  brandCategory: string | null;
  collabCount: number;
  lastCollabAt: string | null;
  postTypes: string[];
}

interface SimilarCreator {
  id: string;
  instagramUsername: string | null;
  fullName: string | null;
  followers: number | null;
  niche: string | null;
  profilePicture: string | null;
  isVerified: boolean | null;
  partnershipCount: number | null;
}

/** Unified profile type — works for both "my profile" and discovered creators */
interface UnifiedProfile {
  // Basic info
  username: string;
  fullName: string | null;
  bio: string | null;
  followers: number;
  following: number | null;
  postsCount: number | null;
  isVerified: boolean;
  profilePicture: string | null;
  niche: string | null;
  externalUrl: string | null;
  updatedAt: string | null;
  followerTier: string;

  // Collab stats (discovered only)
  stats: {
    totalCollabs: number;
    uniqueBrands: number;
    avgEngagement: number;
    engagementRate: number;
    lastCollabAt: string | null;
  } | null;
  brandsWorkedWith: BrandWorkedWith[];
  similarCreators: SimilarCreator[];

  // Enrichment data (both modes)
  enrichment: {
    engagementRate: number | null;
    avgViews: number | null;
    avgLikes: number | null;
    avgComments: number | null;
    postFrequency: number | null;
    viewToFollowerRatio: number | null;
    postTypeMix: { reels: number; images: number; carousels: number } | null;
    postsAnalyzed: number | null;
    contentThemes: string[] | null;
    subNiches: string[] | null;
    primaryLanguage: string | null;
    locationDisplay: string | null;
    countryCode: string | null;
  } | null;
}

interface CreatorApiResponse {
  id: string;
  instagramUsername: string | null;
  fullName: string | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  postsCount: number | null;
  isVerified: boolean | null;
  profilePicture: string | null;
  niche: string | null;
  externalUrl: string | null;
  updatedAt: string | null;
  stats: {
    totalCollabs: number;
    uniqueBrands: number;
    avgEngagement: number;
    engagementRate: number;
    followerTier: string;
    lastCollabAt: string | null;
  };
  brandsWorkedWith: BrandWorkedWith[];
  similarCreators: SimilarCreator[];
  // Enrichment fields
  avgViews: number | null;
  avgLikes: number | null;
  avgComments: number | null;
  enrichmentEngagementRate: string | null;
  postFrequency: string | null;
  viewToFollowerRatio: string | null;
  contentThemes: string[] | null;
  subNiches: string[] | null;
  postTypeMix: { reels: number; images: number; carousels: number } | null;
  primaryLanguage: string | null;
  locationDisplay: string | null;
  countryCode: string | null;
  postsAnalyzed: number | null;
  enrichedAt: string | null;
}

interface MyProfileResponse {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  profilePicture: string | null;
  enrichedAt: string | null;
  bio: string | null;
  avgViews: number | null;
  avgLikes: number | null;
  avgComments: number | null;
  postFrequency: string | null;
  viewToFollowerRatio: string | null;
  contentThemes: string[] | null;
  subNiches: string[] | null;
  postTypeMix: { reels: number; images: number; carousels: number } | null;
  primaryLanguage: string | null;
  locationDisplay: string | null;
  countryCode: string | null;
  postsAnalyzed: number | null;
}

// ============================================
// Helpers
// ============================================

function formatNumber(n: number | null): string {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function getFollowerTier(followers: number): string {
  if (followers >= 1000000) return "Mega";
  if (followers >= 100000) return "Macro";
  if (followers >= 10000) return "Mid-tier";
  if (followers >= 1000) return "Micro";
  return "Nano";
}

function normalizeDiscoveredCreator(data: CreatorApiResponse): UnifiedProfile {
  const followers = data.followers || 0;
  const hasEnrichment = data.enrichedAt != null;

  return {
    username: data.instagramUsername || "",
    fullName: data.fullName,
    bio: data.bio,
    followers,
    following: data.following,
    postsCount: data.postsCount,
    isVerified: data.isVerified || false,
    profilePicture: data.profilePicture,
    niche: data.niche,
    externalUrl: data.externalUrl,
    updatedAt: data.updatedAt,
    followerTier: data.stats.followerTier,
    stats: data.stats,
    brandsWorkedWith: data.brandsWorkedWith,
    similarCreators: data.similarCreators,
    enrichment: hasEnrichment
      ? {
          engagementRate: data.enrichmentEngagementRate ? parseFloat(data.enrichmentEngagementRate) : null,
          avgViews: data.avgViews,
          avgLikes: data.avgLikes,
          avgComments: data.avgComments,
          postFrequency: data.postFrequency ? parseFloat(data.postFrequency) : null,
          viewToFollowerRatio: data.viewToFollowerRatio ? parseFloat(data.viewToFollowerRatio) : null,
          postTypeMix: data.postTypeMix,
          postsAnalyzed: data.postsAnalyzed,
          contentThemes: data.contentThemes,
          subNiches: data.subNiches,
          primaryLanguage: data.primaryLanguage,
          locationDisplay: data.locationDisplay,
          countryCode: data.countryCode,
        }
      : null,
  };
}

function normalizeMyProfile(data: MyProfileResponse, username: string): UnifiedProfile {
  const followers = data.followers || 0;
  const hasEnrichment = data.enrichedAt != null;

  return {
    username: data.instagramUsername || username,
    fullName: null,
    bio: data.bio,
    followers,
    following: null,
    postsCount: null,
    isVerified: false,
    profilePicture: data.profilePicture,
    niche: data.niche,
    externalUrl: null,
    updatedAt: null,
    followerTier: getFollowerTier(followers),
    stats: null,
    brandsWorkedWith: [],
    similarCreators: [],
    enrichment: hasEnrichment
      ? {
          engagementRate: data.engagementRate ? parseFloat(data.engagementRate) : null,
          avgViews: data.avgViews,
          avgLikes: data.avgLikes,
          avgComments: data.avgComments,
          postFrequency: data.postFrequency ? parseFloat(data.postFrequency) : null,
          viewToFollowerRatio: data.viewToFollowerRatio ? parseFloat(data.viewToFollowerRatio) : null,
          postTypeMix: data.postTypeMix,
          postsAnalyzed: data.postsAnalyzed,
          contentThemes: data.contentThemes,
          subNiches: data.subNiches,
          primaryLanguage: data.primaryLanguage,
          locationDisplay: data.locationDisplay,
          countryCode: data.countryCode,
        }
      : null,
  };
}

/** Merge SSE phase data into the unified profile */
function applySSEData(
  base: UnifiedProfile,
  sseProfile: ProfileData | null,
  sseMetrics: MetricsData | null,
  sseAi: AiData | null
): UnifiedProfile {
  const p = { ...base };

  if (sseProfile) {
    p.fullName = sseProfile.fullName;
    p.bio = sseProfile.bio;
    p.followers = sseProfile.followers;
    p.following = sseProfile.following;
    p.postsCount = sseProfile.postsCount;
    p.profilePicture = sseProfile.profilePicture;
    p.isVerified = sseProfile.isVerified;
    p.followerTier = getFollowerTier(sseProfile.followers);
  }

  if (sseMetrics || sseAi) {
    p.enrichment = {
      engagementRate: sseMetrics?.engagementRate ?? p.enrichment?.engagementRate ?? null,
      avgViews: sseMetrics?.avgViews ?? p.enrichment?.avgViews ?? null,
      avgLikes: sseMetrics?.avgLikes ?? p.enrichment?.avgLikes ?? null,
      avgComments: sseMetrics?.avgComments ?? p.enrichment?.avgComments ?? null,
      postFrequency: sseMetrics?.postFrequency ?? p.enrichment?.postFrequency ?? null,
      viewToFollowerRatio: sseMetrics?.viewToFollowerRatio ?? p.enrichment?.viewToFollowerRatio ?? null,
      postTypeMix: sseMetrics?.postTypeMix ?? p.enrichment?.postTypeMix ?? null,
      postsAnalyzed: sseMetrics?.postsAnalyzed ?? p.enrichment?.postsAnalyzed ?? null,
      contentThemes: sseAi?.contentThemes ?? p.enrichment?.contentThemes ?? null,
      subNiches: sseAi?.subNiches ?? p.enrichment?.subNiches ?? null,
      primaryLanguage: sseAi?.primaryLanguage ?? p.enrichment?.primaryLanguage ?? null,
      locationDisplay: sseAi?.locationDisplay ?? p.enrichment?.locationDisplay ?? null,
      countryCode: sseAi?.countryCode ?? p.enrichment?.countryCode ?? null,
    };
  }

  // Derive niche from AI themes if not already set
  if (!p.niche && p.enrichment?.contentThemes?.[0]) {
    p.niche = p.enrichment.contentThemes[0];
  }

  return p;
}

// ============================================
// Unified Creator View
// ============================================

type TabType = "overview" | "collabs" | "similar";

function UnifiedCreatorView({
  profile,
  isMyProfile,
  isStreaming,
  sseProgress,
  sseStatus,
  sseError,
  sseRetry,
  hasMetrics,
  hasAi,
}: {
  profile: UnifiedProfile;
  isMyProfile: boolean;
  isStreaming: boolean;
  sseProgress: number;
  sseStatus: string;
  sseError: string | null;
  sseRetry: () => void;
  hasMetrics: boolean;
  hasAi: boolean;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const confettiFired = useRef(false);

  const isDiscovered = !isMyProfile;
  const hasCollabs = profile.stats != null && profile.stats.totalCollabs > 0;
  const showSSEProgress = isMyProfile && isStreaming;
  const isDone = sseStatus === "done";

  // Fire confetti when SSE completes
  useEffect(() => {
    if (isDone && !confettiFired.current) {
      confettiFired.current = true;
      const end = Date.now() + 1500;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#833AB4", "#FD1D1D", "#FCB045"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#833AB4", "#FD1D1D", "#FCB045"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isDone]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: profile.fullName || profile.username || "Creator",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // Build tabs — always show all 3 tabs
  const tabs: { key: TabType; label: string; icon: typeof LayoutGrid; count?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "collabs", label: "Collabs", icon: Handshake, count: profile.stats?.uniqueBrands },
    { key: "similar", label: "Similar Creators", icon: Users },
  ];

  // Stats grid — only for discovered creators (self mode uses MagicCards for enrichment)
  const statsGrid = isDiscovered && profile.stats
    ? [
        { value: formatNumber(profile.followers), label: "FOLLOWERS" },
        { value: profile.stats.totalCollabs.toString(), label: "COLLABS" },
        { value: profile.stats.uniqueBrands.toString(), label: "BRANDS" },
        { value: timeAgo(profile.stats.lastCollabAt), label: "LAST COLLAB" },
      ]
    : null;

  const e = profile.enrichment;

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Background particles during SSE */}
      {showSSEProgress && (
        <Particles
          className="absolute inset-0 -z-10"
          quantity={30}
          color="#833AB4"
          size={0.4}
        />
      )}

      {/* SSE Progress bar */}
      {showSSEProgress && (
        <BlurFade delay={0}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted)]">
                {sseStatus === "connecting" && "Connecting..."}
                {sseStatus === "streaming" && "Analyzing your profile..."}
                {sseStatus === "idle" && "Starting..."}
              </span>
              <span className="text-sm font-medium text-[var(--accent)]">
                {sseProgress}%
              </span>
            </div>
            <Progress value={sseProgress} className="h-2" />
          </div>
        </BlurFade>
      )}

      {/* SSE Error */}
      {sseStatus === "error" && sseError && (
        <BlurFade delay={0}>
          <div className="bg-[var(--surface)] rounded-2xl border border-red-200 dark:border-red-900 p-6 mb-6 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{sseError}</p>
            <Button onClick={sseRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        </BlurFade>
      )}

      {/* Header */}
      <section className="bg-[var(--surface)] rounded-2xl shadow-lg overflow-hidden animate-fade-up">
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <div className="rounded-full bg-[var(--surface-elevated)] flex items-center justify-center overflow-hidden shadow-sm w-14 h-14">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.fullName || profile.username || "Creator"}
                    width={56}
                    height={56}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-[var(--accent)]">
                    {(profile.username || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight truncate">
                  {profile.fullName || `@${profile.username}`}
                </h1>
                {profile.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap text-sm">
                {profile.niche && (
                  <Badge variant="default" className="text-xs py-0.5 capitalize">{profile.niche}</Badge>
                )}
                <span className="text-[var(--muted)]">@{profile.username}</span>
                {profile.externalUrl && (
                  <>
                    <span className="text-[var(--border)]">&middot;</span>
                    <a
                      href={profile.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:text-[var(--accent-dark)] flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium">
              {profile.followerTier}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  window.open(`https://instagram.com/${profile.username}`, "_blank")
                }
                title="View on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              {isDiscovered && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleShare}
                  title="Share profile"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 mt-8 mb-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-1 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-[var(--accent)]/10"
                    : "bg-[var(--surface-elevated)]"
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />
              )}
            </button>
          ))}
        </div>
        {profile.updatedAt && (
          <span className="text-xs text-[var(--muted)] shrink-0">
            Last update: {timeAgo(profile.updatedAt)}
          </span>
        )}
      </div>

      {/* Tab Content */}
      <section className="animate-fade-in">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Stats Grid — discovered mode only */}
            {statsGrid && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statsGrid.map((stat, index) => (
                  <BlurFade key={stat.label} delay={index * 0.05}>
                    <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 tracking-wider font-medium uppercase">
                        {stat.label}
                      </p>
                    </Card>
                  </BlurFade>
                ))}
              </div>
            )}

            {/* Metrics MagicCards — show when enrichment data exists */}
            {e && hasMetrics && (
              <BlurFade delay={0.1}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {e.engagementRate != null && (
                    <MagicCard className="rounded-xl">
                      <div className="p-4 text-center">
                        <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                          <NumberTicker value={e.engagementRate} decimalPlaces={2} className="text-[var(--foreground)]" />
                          <span className="text-sm font-normal text-[var(--muted)]">%</span>
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wider font-medium">
                          Engagement
                        </div>
                      </div>
                    </MagicCard>
                  )}
                  {e.avgViews != null && (
                    <MagicCard className="rounded-xl">
                      <div className="p-4 text-center">
                        <Eye className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                          <NumberTicker value={e.avgViews} className="text-[var(--foreground)]" />
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wider font-medium">
                          Avg Views
                        </div>
                      </div>
                    </MagicCard>
                  )}
                  {e.avgLikes != null && (
                    <MagicCard className="rounded-xl">
                      <div className="p-4 text-center">
                        <Heart className="w-5 h-5 text-red-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                          <NumberTicker value={e.avgLikes} className="text-[var(--foreground)]" />
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wider font-medium">
                          Avg Likes
                        </div>
                      </div>
                    </MagicCard>
                  )}
                  {e.postFrequency != null && (
                    <MagicCard className="rounded-xl">
                      <div className="p-4 text-center">
                        <BarChart3 className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
                        <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                          <NumberTicker value={e.postFrequency} decimalPlaces={1} className="text-[var(--foreground)]" />
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wider font-medium">
                          Posts/Week
                        </div>
                      </div>
                    </MagicCard>
                  )}
                </div>
              </BlurFade>
            )}

            {/* Metrics skeleton during SSE */}
            {isMyProfile && isStreaming && !hasMetrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            )}

            {/* Content Mix */}
            {e?.postTypeMix && (
              <BlurFade delay={0.15}>
                <div className="bg-[var(--surface)] rounded-xl shadow-md p-5">
                  <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                    Content Mix {e.postsAnalyzed ? `(${e.postsAnalyzed} posts analyzed)` : ""}
                  </h3>
                  <div className="flex gap-3">
                    {e.postTypeMix.reels > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-elevated)]">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm">Reels</span>
                        <span className="text-sm font-medium">{e.postTypeMix.reels}%</span>
                      </div>
                    )}
                    {e.postTypeMix.images > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-elevated)]">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm">Images</span>
                        <span className="text-sm font-medium">{e.postTypeMix.images}%</span>
                      </div>
                    )}
                    {e.postTypeMix.carousels > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-elevated)]">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-sm">Carousels</span>
                        <span className="text-sm font-medium">{e.postTypeMix.carousels}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </BlurFade>
            )}

            {/* AI Insights */}
            {e && hasAi && (
              <BlurFade delay={0.2}>
                <div className="bg-[var(--surface)] rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                      AI Insights
                    </h3>
                  </div>

                  {e.contentThemes && e.contentThemes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-[var(--muted)] mb-2">Content Themes</p>
                      <div className="flex flex-wrap gap-2">
                        {e.contentThemes.map((theme: string) => (
                          <TextAnimate
                            key={theme}
                            as="span"
                            animation="blurInUp"
                            by="text"
                            startOnView={false}
                            className="inline-flex items-center px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium capitalize"
                          >
                            {theme}
                          </TextAnimate>
                        ))}
                      </div>
                    </div>
                  )}

                  {e.subNiches && e.subNiches.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-[var(--muted)] mb-2">Sub-niches</p>
                      <div className="flex flex-wrap gap-2">
                        {e.subNiches.map((niche: string) => (
                          <span
                            key={niche}
                            className="px-3 py-1.5 rounded-full bg-[var(--surface-elevated)] text-sm capitalize"
                          >
                            {niche}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {e.locationDisplay && (
                      <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                        <MapPin className="w-4 h-4" />
                        <span>{e.locationDisplay}</span>
                      </div>
                    )}
                    {e.primaryLanguage && (
                      <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                        <Languages className="w-4 h-4" />
                        <span className="uppercase">{e.primaryLanguage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </BlurFade>
            )}

            {/* AI skeleton during SSE */}
            {isMyProfile && isStreaming && !hasAi && (
              <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-6 animate-pulse">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            )}

            {/* About / Bio */}
            {profile.bio && (
              <div className="bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">About</h3>
                <p className="text-[var(--foreground)] whitespace-pre-line leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Brands Preview — discovered only */}
            {isDiscovered && profile.brandsWorkedWith.length > 0 && (
              <div className="bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Brands Worked With</h3>
                  <button
                    onClick={() => setActiveTab("collabs")}
                    className="text-xs text-[var(--accent)] hover:text-[var(--accent-dark)] flex items-center gap-1 font-medium"
                  >
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.brandsWorkedWith.slice(0, 8).map((brand) => (
                    <Link
                      key={brand.brandId}
                      href={`/brand/${brand.brandUsername}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-elevated)] hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center overflow-hidden">
                        {brand.brandLogo ? (
                          <Image
                            src={brand.brandLogo}
                            alt={brand.brandName}
                            width={32}
                            height={32}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[var(--accent)]">
                            {brand.brandName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors">
                          {brand.brandName}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {brand.collabCount} {brand.collabCount === 1 ? "collab" : "collabs"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA — self mode, after enrichment complete */}
            {isMyProfile && (isDone || (!isStreaming && profile.enrichment)) && (
              <BlurFade delay={0.3}>
                <div className="text-center py-6">
                  <ShimmerButton
                    onClick={() => router.push("/dashboard")}
                    className="mx-auto h-14 px-8 text-base font-semibold"
                    shimmerColor="#ffffff"
                    background="linear-gradient(135deg, #833AB4, #FD1D1D, #FCB045)"
                  >
                    Explore your brand matches
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </ShimmerButton>
                </div>
              </BlurFade>
            )}
          </div>
        )}

        {activeTab === "collabs" && (
          <div className="space-y-3">
            {isMyProfile && profile.brandsWorkedWith.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface)] rounded-xl shadow-md">
                <Handshake className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No collabs tracked yet</h3>
                <p className="text-[var(--muted)] mb-6 max-w-sm mx-auto">
                  Start pitching brands and track your partnerships here.
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                  Find brands to pitch
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : profile.brandsWorkedWith.length > 0 ? (
              profile.brandsWorkedWith.map((brand, index) => (
                <Link
                  key={brand.brandId}
                  href={`/brand/${brand.brandUsername}`}
                  className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-up group"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                >
                  <div className="w-12 h-12 rounded-lg bg-[var(--surface-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                    {brand.brandLogo ? (
                      <Image
                        src={brand.brandLogo}
                        alt={brand.brandName}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-[var(--accent)]">
                        {brand.brandName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                        {brand.brandName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--muted)] mt-0.5">
                      <span>@{brand.brandUsername}</span>
                      {brand.brandCategory && (
                        <>
                          <span className="text-[var(--border)]">&middot;</span>
                          <span className="capitalize">{brand.brandCategory}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
                        <Zap className="w-3 h-3" />
                        {brand.collabCount} {brand.collabCount === 1 ? "collab" : "collabs"}
                      </span>
                      {brand.postTypes.length > 0 && (
                        <div className="flex gap-1.5">
                          {brand.postTypes.slice(0, 3).map((type) => (
                            <Badge key={type} variant="muted" className="capitalize text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-[var(--surface)] rounded-xl shadow-md">
                <Building2 className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
                <p className="text-[var(--muted)]">No brand collaborations detected yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "similar" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {isMyProfile && profile.similarCreators.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-[var(--surface)] rounded-xl shadow-md">
                <Users className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Similar creators</h3>
                <p className="text-[var(--muted)] max-w-sm mx-auto">
                  Once your profile is fully analyzed, we&apos;ll show creators with a similar audience and niche.
                </p>
              </div>
            ) : profile.similarCreators.length > 0 ? (
              profile.similarCreators.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/creator/${similar.instagramUsername}`}
                  className="p-4 bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                      {similar.profilePicture ? (
                        <Image
                          src={similar.profilePicture}
                          alt={similar.fullName || similar.instagramUsername || "Creator"}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[var(--accent)] font-bold">
                          {(similar.instagramUsername || "?").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                          @{similar.instagramUsername}
                        </p>
                        {similar.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        {formatNumber(similar.followers)} followers
                      </p>
                      {similar.partnershipCount && similar.partnershipCount > 0 && (
                        <p className="text-xs text-[var(--accent)]">
                          {similar.partnershipCount} collabs
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-[var(--surface)] rounded-xl shadow-md">
                <Sparkles className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
                <p className="text-[var(--muted)]">No similar creators found</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const username = params.username as string;

  const [unifiedProfile, setUnifiedProfile] = useState<UnifiedProfile | null>(null);
  const [myProfileRaw, setMyProfileRaw] = useState<MyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isMyProfile, setIsMyProfile] = useState<boolean | null>(null);

  // SSE — only active for self mode when not already enriched
  const needsSSE = isMyProfile === true && myProfileRaw?.enrichedAt == null;
  const {
    status: sseStatus,
    progress: sseProgress,
    profile: sseProfile,
    metrics: sseMetrics,
    ai: sseAi,
    error: sseError,
    retry: sseRetry,
  } = useEnrichmentStream(
    needsSSE ? username : null,
    needsSSE ? session?.user?.id ?? null : null
  );

  // Merge SSE data into unified profile whenever it changes
  useEffect(() => {
    if (!isMyProfile || !unifiedProfile) return;
    if (!sseProfile && !sseMetrics && !sseAi) return;

    setUnifiedProfile((prev) => {
      if (!prev) return prev;
      return applySSEData(prev, sseProfile, sseMetrics, sseAi);
    });
  }, [sseProfile, sseMetrics, sseAi, isMyProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMyProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/instagram/me?userId=${encodeURIComponent(session.user.id)}`);
      if (res.ok) {
        const json = await res.json();
        const profile = json.data as MyProfileResponse | null;
        setMyProfileRaw(profile);

        if (profile?.instagramUsername?.toLowerCase() === username.toLowerCase()) {
          setIsMyProfile(true);
          setUnifiedProfile(normalizeMyProfile(profile, username));
          setLoading(false);
        } else {
          setIsMyProfile(false);
        }
      } else {
        setIsMyProfile(false);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setIsMyProfile(false);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user?.id, username]);

  const fetchCreator = useCallback(async () => {
    if (isMyProfile !== false) return;
    try {
      const res = await fetch(`/api/creators/by-username/${encodeURIComponent(username)}`);
      if (res.ok) {
        const json = await res.json();
        setUnifiedProfile(normalizeDiscoveredCreator(json.data));
      } else if (res.status === 404) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch creator:", error);
    } finally {
      setLoading(false);
    }
  }, [username, router, isMyProfile]);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  useEffect(() => {
    if (isMyProfile === false) {
      fetchCreator();
    }
  }, [isMyProfile, fetchCreator]);

  // For the dashboard shell sidebar profile
  const shellProfile = myProfileRaw ? {
    id: myProfileRaw.id,
    instagramUsername: myProfileRaw.instagramUsername,
    followers: myProfileRaw.followers,
    engagementRate: myProfileRaw.engagementRate,
    niche: myProfileRaw.niche,
    profilePicture: myProfileRaw.profilePicture,
  } : null;

  const isStreaming = sseStatus === "streaming" || sseStatus === "connecting" || sseStatus === "idle";
  const hasMetrics = unifiedProfile?.enrichment?.avgViews != null || unifiedProfile?.enrichment?.engagementRate != null;
  const hasAi = (unifiedProfile?.enrichment?.contentThemes?.length ?? 0) > 0;

  return (
    <DashboardShell profile={shellProfile} profileLoading={profileLoading}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
        </div>
      ) : unifiedProfile ? (
        <UnifiedCreatorView
          profile={unifiedProfile}
          isMyProfile={isMyProfile === true}
          isStreaming={needsSSE ? isStreaming : false}
          sseProgress={sseProgress}
          sseStatus={sseStatus}
          sseError={sseError}
          sseRetry={sseRetry}
          hasMetrics={hasMetrics}
          hasAi={hasAi}
        />
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Creator not found</h2>
            <p className="text-[var(--muted)] mb-4">
              This creator doesn&apos;t exist or hasn&apos;t been discovered yet.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
