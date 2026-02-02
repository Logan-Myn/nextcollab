"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ArrowLeft,
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
} from "lucide-react";
import { ActivityChart } from "@/components/brand/ActivityChart";

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
  updatedAt: string | null;
  stats: {
    totalCollabs: number;
    uniqueCreators: number;
    avgCreatorFollowers: number;
    lastCollabAt: string | null;
  };
  collabs: Collab[];
  similarBrands: SimilarBrand[];
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
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchReasons, setMatchReasons] = useState<string[]>([]);
  const [statsRevealed, setStatsRevealed] = useState(false);

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

  // Calculate match score based on creator profile
  useEffect(() => {
    if (!brand || !profile) return;

    let score = 50;
    const reasons: string[] = [];

    // Niche alignment
    const creatorNiche = profile.niche?.toLowerCase();
    const brandCategory = brand.category?.toLowerCase();
    const brandNiche = brand.niche?.toLowerCase();
    const brandNiches = Array.isArray(brand.typicalCreatorNiches)
      ? brand.typicalCreatorNiches.map((n) => n.toLowerCase())
      : [];

    if (creatorNiche) {
      if (brandCategory === creatorNiche || brandNiche === creatorNiche || brandNiches.includes(creatorNiche)) {
        score += 25;
        reasons.push(`Partners with ${profile.niche} creators`);
      } else if (brandNiches.some((n) => n.includes(creatorNiche) || creatorNiche.includes(n))) {
        score += 15;
        reasons.push("Related niche alignment");
      }
    }

    // Follower range fit
    const creatorFollowers = profile.followers || 0;
    const typicalMin = brand.typicalFollowerMin || 0;
    const typicalMax = brand.typicalFollowerMax || Infinity;

    if (creatorFollowers >= typicalMin && creatorFollowers <= typicalMax) {
      score += 20;
      reasons.push("Your follower count fits their range");
    } else if (brand.stats.avgCreatorFollowers > 0) {
      const ratio = creatorFollowers / brand.stats.avgCreatorFollowers;
      if (ratio >= 0.5 && ratio <= 2) {
        score += 15;
        reasons.push("Similar size to their partners");
      }
    }

    // Activity
    const partnershipCount = brand.partnershipCount || 0;
    if (partnershipCount >= 5) {
      score += 12;
      reasons.push(`Very active (${partnershipCount} recent collabs)`);
    } else if (partnershipCount >= 2) {
      score += 8;
      reasons.push(`Active (${partnershipCount} recent collabs)`);
    }

    // Verified bonus
    if (brand.isVerifiedAccount) {
      score += 3;
    }

    setMatchScore(Math.min(score, 100));
    setMatchReasons(reasons.length > 0 ? reasons : ["Brand sponsors creators on Instagram"]);
  }, [brand, profile]);

  useEffect(() => {
    fetchProfile();
    fetchBrand();
  }, [fetchProfile, fetchBrand]);

  const handleSave = () => {
    setSaved(!saved);
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
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Hero Section - Shadow-first, no gradient */}
          <section className="bg-[var(--surface)] rounded-2xl shadow-lg overflow-hidden animate-fade-up">
            <div className="p-6 sm:p-8">
              {/* Top row: Avatar + Info + Match Score */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
                {/* Larger Avatar (104px) */}
                <div className="relative shrink-0">
                  <div className="rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center overflow-hidden shadow-md" style={{ width: '104px', height: '104px' }}>
                    {brand.profilePicture ? (
                      <Image
                        src={brand.profilePicture}
                        alt={brand.name}
                        width={104}
                        height={104}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[var(--accent)]">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Brand Info */}
                <div className="flex-1 min-w-0">
                  {/* Name with inline verified badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{brand.name}</h1>
                    {brand.isVerifiedAccount && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--accent-secondary)] shrink-0" />
                    )}
                  </div>
                  <p className="text-[var(--muted)] mt-1">@{brand.instagramUsername}</p>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {brand.category && (
                      <span className="badge badge-accent">{brand.category}</span>
                    )}
                    {brand.niche && brand.niche !== brand.category && (
                      <span className="badge badge-muted">{brand.niche}</span>
                    )}
                    {brand.location && (
                      <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
                        <Globe className="w-3.5 h-3.5" />
                        {brand.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score - Clean design */}
                {matchScore !== null && (
                  <div className="shrink-0 text-center mt-2 sm:mt-0">
                    <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">Match</span>
                    <p
                      className={`text-4xl font-bold tracking-tight ${
                        matchScore >= 85
                          ? "text-[var(--success)]"
                          : matchScore >= 70
                            ? "text-[var(--accent)]"
                            : "text-[var(--warning)]"
                      }`}
                    >
                      {matchScore}%
                    </p>
                  </div>
                )}
              </div>

              {/* Stats Bar - Clean with horizontal dividers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 py-6 border-t border-b border-[var(--border)]">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`text-center py-2 transition-all duration-500 ${
                      statsRevealed
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    } ${index < stats.length - 1 ? "sm:border-r sm:border-[var(--border)]" : ""}`}
                    style={{ transitionDelay: `${index * 75}ms` }}
                  >
                    <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-[var(--muted)] mt-1.5 tracking-wider font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  disabled
                  className="flex-1 btn btn-primary opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <MessageSquare className="w-4 h-4" />
                  Pitch This Brand
                  <span className="text-[10px] ml-1 opacity-70">Soon</span>
                </button>
                <button
                  onClick={handleSave}
                  className={`icon-btn ${saved ? "active" : ""}`}
                  style={{ width: "40px", height: "40px" }}
                >
                  <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() =>
                    window.open(`https://instagram.com/${brand.instagramUsername}`, "_blank")
                  }
                  className="icon-btn"
                  style={{ width: "40px", height: "40px" }}
                >
                  <Instagram className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="icon-btn"
                  style={{ width: "40px", height: "40px" }}
                >
                  <Share2 className="w-5 h-5" />
                </button>
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
            {brand.updatedAt && (
              <span className="text-xs text-[var(--muted)] shrink-0">
                Last update: {timeAgo(brand.updatedAt)}
              </span>
            )}
          </div>

          {/* Tab Content */}
          <section className="animate-fade-in">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Activity Chart */}
                <ActivityChart brandId={brand.id} />

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
                          <span key={type} className="badge badge-secondary">
                            {type}
                          </span>
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
                              <span key={niche} className="badge badge-accent">
                                {niche}
                              </span>
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
                                <span key={type} className="badge badge-muted capitalize text-xs">
                                  {type}
                                </span>
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

            {activeTab === "fit" && (
              <div className="bg-[var(--surface)] rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                      matchScore && matchScore >= 85
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : matchScore && matchScore >= 70
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "bg-[var(--warning)]/10 text-[var(--warning)]"
                    }`}
                  >
                    {matchScore || 0}%
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {matchScore && matchScore >= 85
                        ? "Excellent Match"
                        : matchScore && matchScore >= 70
                          ? "Strong Match"
                          : "Potential Match"}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      Based on your profile and their partnership history
                    </p>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Why you match</h4>
                  {matchReasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-elevated)]">
                      <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Stats Comparison */}
                {profile && (
                  <div className="mt-6 pt-6 border-t border-[var(--border)]">
                    <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Your Profile vs Their Partners</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
                        <span className="text-xs text-[var(--muted)]">Your Followers</span>
                        <p className="text-xl font-bold">{formatNumber(profile.followers)}</p>
                        <span className="text-xs text-[var(--muted)]">
                          {getFollowerTier(profile.followers || 0)} creator
                        </span>
                      </div>
                      <div className="p-4 rounded-lg bg-[var(--surface-elevated)]">
                        <span className="text-xs text-[var(--muted)]">Their Avg Partner</span>
                        <p className="text-xl font-bold">{formatNumber(brand.stats.avgCreatorFollowers)}</p>
                        <span className="text-xs text-[var(--muted)]">
                          {getFollowerTier(brand.stats.avgCreatorFollowers || 0)} creators
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
            <Link href="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
