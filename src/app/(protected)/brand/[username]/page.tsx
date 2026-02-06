"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ExternalLink,
  Heart,
  MessageSquare,
  Share2,
  Globe,
  CheckCircle2,
  Loader2,
  Instagram,
  Zap,
  ChevronRight,
  LayoutGrid,
  Handshake,
  Target,
  Building2,
  Play,
  ImageIcon,
} from "lucide-react";
import { ActivityChart } from "@/components/brand/ActivityChart";
import { FitAnalysisCard } from "@/components/brand/FitAnalysisCard";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BlurFade } from "@/components/ui/blur-fade";
import { PitchWizard } from "@/components/pitch/PitchWizard";
import type { CreatorData, BrandData } from "@/lib/ai/pitch-prompts";
import type { FitAnalysis } from "@/lib/fit-analysis";

interface Collab {
  creatorUsername: string | null;
  creatorFollowers: number | null;
  creatorNiche: string | null;
  collabCount: number;
  totalEngagement: number;
  avgEngagement: number;
  engagementRate: number;
  lastCollabAt: string | null;
  postTypes: string[] | null;
  postUrls: string[] | null;
  creator: {
    id: string | null;
    fullName: string | null;
    profilePicture: string | null;
    followers: number | null;
    isVerified: boolean | null;
  } | null;
}

interface SimilarBrand {
  id: string;
  name: string;
  instagramUsername: string | null;
  category: string | null;
  niche: string | null;
  followers: number | null;
  partnershipCount: number | null;
  isVerifiedAccount: boolean | null;
  profilePicture: string | null;
}

interface BrandDetail {
  id: string;
  name: string;
  instagramUsername: string | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  niche: string | null;
  category: string | null;
  location: string | null;
  websiteUrl: string | null;
  hasWebsite: boolean | null;
  isVerifiedAccount: boolean | null;
  partnershipCount: number | null;
  activityScore: number | null;
  typicalFollowerMin: number | null;
  typicalFollowerMax: number | null;
  typicalCreatorNiches: string[] | null;
  preferredPostTypes: string[] | null;
  contentPreference: string | null;
  profilePicture: string | null;
  lastPartnershipAt: string | null;
  lastScrapedAt: string | null;
  stats: {
    totalCollabs: number;
    uniqueCreators: number;
    avgCreatorFollowers: number;
    lastCollabAt: string | null;
  };
  collabs: Collab[];
  similarBrands: SimilarBrand[];
  latestPosts: Array<{
    postUrl: string | null;
    displayUrl: string | null;
    postType: string | null;
    creatorUsername: string | null;
    detectedAt: string | null;
  }>;
}

interface CreatorProfile {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  profilePicture: string | null;
}

function formatNumber(n: number | null): string {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getFollowerTier(followers: number): string {
  if (followers >= 1000000) return "Mega";
  if (followers >= 500000) return "Macro";
  if (followers >= 100000) return "Mid-tier";
  if (followers >= 10000) return "Micro";
  return "Nano";
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

type TabType = "overview" | "collabs" | "fit";

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const username = params.username as string;

  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Favorites hook for save functionality
  const { isSaved, isSaving, toggleSave } = useFavorites(session?.user?.id);
  const [fitAnalysis, setFitAnalysis] = useState<FitAnalysis | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [statsRevealed, setStatsRevealed] = useState(false);
  const [pitchWizardOpen, setPitchWizardOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/instagram/me?userId=${encodeURIComponent(session.user.id)}`);
      if (res.ok) {
        const json = await res.json();
        setProfile(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user?.id]);

  const fetchBrand = useCallback(async () => {
    try {
      const res = await fetch(`/api/brands/by-username/${encodeURIComponent(username)}`);
      if (res.ok) {
        const json = await res.json();
        setBrand(json.data);
        setTimeout(() => setStatsRevealed(true), 100);
      } else if (res.status === 404) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch brand:", error);
    } finally {
      setLoading(false);
    }
  }, [username, router]);

  // Fetch real fit analysis when brand and session are available
  const fetchFitAnalysis = useCallback(async () => {
    if (!brand || !session?.user?.id) return;
    setFitLoading(true);
    try {
      const res = await fetch(`/api/brands/${brand.id}/fit?userId=${encodeURIComponent(session.user.id)}`);
      if (res.ok) {
        const json = await res.json();
        setFitAnalysis(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch fit analysis:", error);
    } finally {
      setFitLoading(false);
    }
  }, [brand, session?.user?.id]);

  useEffect(() => {
    fetchProfile();
    fetchBrand();
  }, [fetchProfile, fetchBrand]);

  useEffect(() => {
    fetchFitAnalysis();
  }, [fetchFitAnalysis]);

  const handleSave = async () => {
    if (brand) {
      try {
        await toggleSave(brand.id);
      } catch (err) {
        console.error("[BrandDetail] Save error:", err);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: brand?.name || "Brand",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const stats = brand
    ? [
        { value: formatNumber(brand.followers), label: "FOLLOWERS" },
        { value: brand.stats.totalCollabs.toString(), label: "COLLABS" },
        { value: brand.stats.uniqueCreators.toString(), label: "CREATORS" },
        { value: timeAgo(brand.stats.lastCollabAt), label: "LAST COLLAB" },
      ]
    : [];

  return (
    <DashboardShell profile={profile} profileLoading={profileLoading}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
        </div>
      ) : brand ? (
        <div className="max-w-5xl mx-auto">
          {/* Compact Header - Editorial style */}
          <section className="bg-[var(--surface)] rounded-2xl shadow-lg overflow-hidden animate-fade-up">
            <div className="p-5">
              {/* Single row: Avatar + Info + Actions */}
              <div className="flex items-center gap-4">
                {/* Compact Avatar (56px) */}
                <div className="shrink-0">
                  <div className="rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center overflow-hidden shadow-sm w-14 h-14">
                    {brand.profilePicture ? (
                      <Image
                        src={brand.profilePicture}
                        alt={brand.name}
                        width={56}
                        height={56}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-[var(--accent)]">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Brand Info - Compact horizontal */}
                <div className="flex-1 min-w-0">
                  {/* Name row with verified badge */}
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight truncate">{brand.name}</h1>
                    {brand.isVerifiedAccount && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                    )}
                  </div>

                  {/* Meta row: categories + handle + website */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-sm">
                    {brand.category && (
                      <Badge variant="default" className="text-xs py-0.5">{brand.category}</Badge>
                    )}
                    <span className="text-[var(--muted)]">@{brand.instagramUsername}</span>
                    {brand.websiteUrl && (
                      <>
                        <span className="text-[var(--border)]">·</span>
                        <a
                          href={brand.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:text-[var(--accent-dark)] flex items-center gap-1 transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">
                            {brand.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "").split('/')[0]}
                          </span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Match Score - Compact pill */}
                {fitAnalysis && (
                  <div className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold ${
                    fitAnalysis.overallScore >= 80
                      ? "bg-[var(--success)]/10 text-[var(--success)]"
                      : fitAnalysis.overallScore >= 60
                        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "bg-[var(--warning)]/10 text-[var(--warning)]"
                  }`}>
                    {fitAnalysis.overallScore}% match
                  </div>
                )}
                {fitLoading && !fitAnalysis && (
                  <div className="shrink-0 px-3 py-1.5 rounded-full text-sm font-bold bg-[var(--surface-elevated)] text-[var(--muted)]">
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  </div>
                )}

                {/* Action buttons - Inline */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleSave}
                    disabled={isSaving(brand.id)}
                    className={isSaved(brand.id) ? "text-primary" : ""}
                    title={isSaved(brand.id) ? "Saved" : "Save"}
                  >
                    <Heart className={`w-4 h-4 ${isSaved(brand.id) ? "fill-current" : ""} ${isSaving(brand.id) ? "animate-pulse" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      window.open(`https://instagram.com/${brand.instagramUsername}`, "_blank")
                    }
                    title="View on Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleShare}
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPitchWizardOpen(true)}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-dark)]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Pitch</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs - Icon style */}
          <div className="flex items-center gap-1 mt-8 mb-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-1 flex-1">
            {([
              { key: "overview" as TabType, label: "Overview", icon: LayoutGrid },
              { key: "collabs" as TabType, label: "Collabs", icon: Handshake, count: brand.stats.uniqueCreators },
              { key: "fit" as TabType, label: "Fit Analysis", icon: Target },
            ]).map((tab) => (
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
            {brand.lastScrapedAt && (
              <span className="text-xs text-[var(--muted)] shrink-0">
                Last update: {timeAgo(brand.lastScrapedAt)}
              </span>
            )}
          </div>

          {/* Tab Content */}
          <section className="animate-fade-in">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Stats Cards - Moved from header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.map((stat, index) => (
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

                {/* Activity Chart */}
                <ActivityChart brandId={brand.id} />

                {/* Latest Sponsored Posts */}
                {brand.latestPosts && brand.latestPosts.length > 0 && (
                  <BlurFade delay={0.15}>
                    <Card className="p-5 overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                          Latest Sponsored Posts
                        </h3>
                        <button
                          onClick={() => setActiveTab("collabs")}
                          className="text-xs text-[var(--accent)] hover:text-[var(--accent-dark)] font-medium flex items-center gap-1 transition-colors"
                        >
                          View all
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {brand.latestPosts.map((post, index) => (
                          <BlurFade key={index} delay={0.05 * index}>
                            <a
                              href={post.postUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--surface-elevated)] block"
                            >
                              {post.displayUrl ? (
                                <Image
                                  src={post.displayUrl}
                                  alt={`Sponsored post by @${post.creatorUsername}`}
                                  fill
                                  unoptimized
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-[var(--muted)]" />
                                </div>
                              )}

                              {/* Gradient overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* Post type badge */}
                              <div className="absolute top-2 right-2">
                                <Badge
                                  variant="secondary"
                                  className="bg-black/60 text-white border-0 text-[10px] px-1.5 py-0.5 backdrop-blur-sm"
                                >
                                  {post.postType === "reel" ? (
                                    <Play className="w-2.5 h-2.5 mr-0.5 fill-current" />
                                  ) : null}
                                  {post.postType || "post"}
                                </Badge>
                              </div>

                              {/* Creator info on hover */}
                              <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-xs font-medium truncate">
                                  @{post.creatorUsername}
                                </p>
                                <p className="text-white/70 text-[10px]">
                                  {timeAgo(post.detectedAt)}
                                </p>
                              </div>

                              {/* Shine effect on hover */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </a>
                          </BlurFade>
                        ))}
                      </div>
                    </Card>
                  </BlurFade>
                )}

                {/* Bio */}
                {brand.bio && (
                  <div className="bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                    <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">About</h3>
                    <p className="text-[var(--foreground)] leading-relaxed">{brand.bio}</p>
                  </div>
                )}

                {/* Website & Content Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {brand.websiteUrl && (
                    <div className="bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                      <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Website</h3>
                      <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        {brand.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {brand.preferredPostTypes && brand.preferredPostTypes.length > 0 && (
                    <div className="bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                      <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                        Content Types
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {brand.preferredPostTypes.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Creator Targeting */}
                {(brand.typicalCreatorNiches?.length || brand.typicalFollowerMin) && (
                  <div className="bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                    <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                      Creator Targeting
                    </h3>
                    <div className="space-y-4">
                      {brand.typicalCreatorNiches && brand.typicalCreatorNiches.length > 0 && (
                        <div>
                          <span className="text-xs text-[var(--muted)]">Preferred Niches</span>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {brand.typicalCreatorNiches.map((niche) => (
                              <Badge key={niche} variant="default">
                                {niche}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(brand.typicalFollowerMin || brand.typicalFollowerMax) && (
                        <div>
                          <span className="text-xs text-[var(--muted)]">Follower Range</span>
                          <p className="font-medium mt-1">
                            {formatNumber(brand.typicalFollowerMin || 0)} -{" "}
                            {formatNumber(brand.typicalFollowerMax || 0)} followers
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "collabs" && (
              <div className="space-y-3">
                {brand.collabs && brand.collabs.length > 0 ? (
                  brand.collabs.map((collab, index) => (
                    <Link
                      key={collab.creatorUsername || index}
                      href={`/creator/${collab.creatorUsername}`}
                      className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all animate-fade-up group"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                    >
                      {/* Creator Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                        {collab.creator?.profilePicture ? (
                          <Image
                            src={collab.creator.profilePicture}
                            alt={collab.creatorUsername || "Creator"}
                            width={48}
                            height={48}
                            unoptimized
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-[var(--accent)]">
                            {(collab.creatorUsername || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Creator Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                            @{collab.creatorUsername}
                          </span>
                          {collab.creator?.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--muted)] mt-0.5">
                          <span>{formatNumber(collab.creatorFollowers)} followers</span>
                          {collab.creatorNiche && (
                            <>
                              <span className="text-[var(--border)]">·</span>
                              <span className="capitalize">{collab.creatorNiche}</span>
                            </>
                          )}
                        </div>

                        {/* Collab Stats */}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
                            <Zap className="w-3 h-3" />
                            {collab.collabCount} {collab.collabCount === 1 ? 'collab' : 'collabs'}
                          </span>
                          {collab.postTypes && collab.postTypes.length > 0 && (
                            <div className="flex gap-1.5">
                              {[...new Set(collab.postTypes.filter(Boolean))].slice(0, 3).map((type) => (
                                <Badge key={type} variant="muted" className="capitalize text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-3 shrink-0">
                        {collab.lastCollabAt && (
                          <span className="text-xs text-[var(--muted)]">
                            {timeAgo(collab.lastCollabAt)}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 bg-[var(--surface)] rounded-xl shadow-md">
                    <Building2 className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
                    <p className="text-[var(--muted)]">No collabs detected yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "fit" && session?.user?.id && (
              <FitAnalysisCard
                brandId={brand.id}
                userId={session.user.id}
                prefetchedAnalysis={fitAnalysis}
              />
            )}
          </section>

          {/* Similar Brands */}
          {brand.similarBrands.length > 0 && (
            <section className="mt-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Similar Brands</h2>
                <Link
                  href="/dashboard/discover"
                  className="text-sm text-[var(--accent)] hover:text-[var(--accent-dark)] flex items-center gap-1 font-medium"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {brand.similarBrands.map((similar) => (
                  <Link
                    key={similar.id}
                    href={`/brand/${similar.instagramUsername}`}
                    className="p-4 bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--surface-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                        {similar.profilePicture ? (
                          <Image
                            src={similar.profilePicture}
                            alt={similar.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[var(--accent)] font-bold">
                            {similar.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                          {similar.name}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate">
                          {similar.category || similar.niche || "Brand"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Brand not found</h2>
            <p className="text-[var(--muted)] mb-4">
              This brand doesn&apos;t exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Pitch Wizard */}
      {brand && session?.user?.id && (
        <PitchWizard
          open={pitchWizardOpen}
          onOpenChange={setPitchWizardOpen}
          creator={profile ? {
            username: profile.instagramUsername || "",
            followers: profile.followers,
            engagementRate: profile.engagementRate,
            niche: profile.niche,
          } : null}
          brand={{
            name: brand.name,
            instagramUsername: brand.instagramUsername,
            category: brand.category,
            niche: brand.niche,
            typicalCreatorNiches: brand.typicalCreatorNiches,
            bio: brand.bio,
            followers: brand.followers,
            avgCreatorFollowers: brand.stats.avgCreatorFollowers,
            profilePicture: brand.profilePicture,
            isVerifiedAccount: brand.isVerifiedAccount,
          }}
          brandId={brand.id}
          userId={session.user.id}
        />
      )}
    </DashboardShell>
  );
}
