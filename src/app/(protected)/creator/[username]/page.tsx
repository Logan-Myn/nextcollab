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
  Share2,
  Users,
  Zap,
  Globe,
  CheckCircle2,
  Loader2,
  Instagram,
  Sparkles,
  BarChart3,
  ChevronRight,
  Building2,
} from "lucide-react";

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

interface CreatorDetail {
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

function getTierLabel(tier: string): { label: string; class: string } {
  switch (tier) {
    case "mega":
      return { label: "Mega Creator", class: "text-[var(--accent)]" };
    case "macro":
      return { label: "Macro Creator", class: "text-[var(--success)]" };
    case "mid":
      return { label: "Mid-tier Creator", class: "text-[var(--warning)]" };
    case "micro":
      return { label: "Micro Creator", class: "text-[var(--accent-secondary)]" };
    default:
      return { label: "Nano Creator", class: "text-[var(--muted)]" };
  }
}

type TabType = "overview" | "collabs" | "similar";

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const username = params.username as string;

  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

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

  const fetchCreator = useCallback(async () => {
    try {
      const res = await fetch(`/api/creators/by-username/${encodeURIComponent(username)}`);
      if (res.ok) {
        const json = await res.json();
        setCreator(json.data);
      } else if (res.status === 404) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch creator:", error);
    } finally {
      setLoading(false);
    }
  }, [username, router]);

  useEffect(() => {
    fetchProfile();
    fetchCreator();
  }, [fetchProfile, fetchCreator]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: creator?.fullName || creator?.instagramUsername || "Creator",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const tier = creator ? getTierLabel(creator.stats.followerTier) : null;

  return (
    <DashboardShell profile={profile} profileLoading={profileLoading}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
        </div>
      ) : creator ? (
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Hero Section */}
          <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden animate-fade-up">
            {/* Gradient Header */}
            <div className="h-20 bg-gradient-to-r from-[var(--accent-secondary)]/20 via-[var(--accent)]/20 to-[var(--surface-elevated)]" />

            {/* Profile Content */}
            <div className="px-8 pb-8 -mt-10">
              {/* Avatar + Basic Info */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-[var(--surface-elevated)] border-4 border-[var(--surface)] flex items-center justify-center overflow-hidden shadow-lg">
                    {creator.profilePicture ? (
                      <Image
                        src={creator.profilePicture}
                        alt={creator.fullName || creator.instagramUsername || "Creator"}
                        width={80}
                        height={80}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-[var(--accent)]">
                        {(creator.instagramUsername || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {creator.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--accent-secondary)] rounded-full flex items-center justify-center border-2 border-[var(--surface)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Creator Info */}
                <div className="flex-1 min-w-0 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">
                      {creator.fullName || `@${creator.instagramUsername}`}
                    </h1>
                    {tier && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] ${tier.class}`}>
                        {tier.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--muted)] mt-0.5">@{creator.instagramUsername}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {creator.niche && (
                      <span className="badge badge-accent">{creator.niche}</span>
                    )}
                    {creator.externalUrl && (
                      <a
                        href={creator.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Stats Badge */}
                <div className="shrink-0 flex flex-col items-center justify-center px-5 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] mt-2 sm:mt-0">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">Brands</span>
                  <span className="text-3xl font-bold text-[var(--accent)]">
                    {creator.stats.uniqueBrands}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Users className="w-4 h-4 text-[var(--accent-secondary)]" />
                    <span className="text-xs text-[var(--muted)]">Followers</span>
                  </div>
                  <p className="text-xl font-bold">{formatNumber(creator.followers)}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Zap className="w-4 h-4 text-[var(--success)]" />
                    <span className="text-xs text-[var(--muted)]">Collabs</span>
                  </div>
                  <p className="text-xl font-bold">{creator.stats.totalCollabs}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Building2 className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs text-[var(--muted)]">Brands</span>
                  </div>
                  <p className="text-xl font-bold">{creator.stats.uniqueBrands}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <BarChart3 className="w-4 h-4 text-[var(--warning)]" />
                    <span className="text-xs text-[var(--muted)]">Following</span>
                  </div>
                  <p className="text-xl font-bold">{formatNumber(creator.following)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    window.open(`https://instagram.com/${creator.instagramUsername}`, "_blank")
                  }
                  className="flex-1 btn btn-primary"
                >
                  <Instagram className="w-4 h-4" />
                  View on Instagram
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

          {/* Tabs */}
          <div className="tab-nav mt-6 mb-4">
            {(["overview", "collabs", "similar"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-nav-item ${activeTab === tab ? "active" : ""}`}
              >
                {tab === "overview" && "Overview"}
                {tab === "collabs" && `Collabs (${creator.stats.uniqueBrands})`}
                {tab === "similar" && "Similar Creators"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <section className="animate-fade-in">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Bio */}
                {creator.bio && (
                  <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
                    <h3 className="text-sm font-semibold text-[var(--muted)] mb-2">About</h3>
                    <p className="text-[var(--foreground)] whitespace-pre-line">{creator.bio}</p>
                  </div>
                )}

                {/* Quick Brand List */}
                {creator.brandsWorkedWith.length > 0 && (
                  <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[var(--muted)]">Brands Worked With</h3>
                      <button
                        onClick={() => setActiveTab("collabs")}
                        className="text-xs text-[var(--accent)] hover:text-[var(--accent-dark)] flex items-center gap-1"
                      >
                        View all
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {creator.brandsWorkedWith.slice(0, 8).map((brand) => (
                        <Link
                          key={brand.brandId}
                          href={`/brand/${brand.brandUsername}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--accent)]/10 transition-colors group"
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
              </div>
            )}

            {activeTab === "collabs" && (
              <div className="space-y-3">
                {creator.brandsWorkedWith.length > 0 ? (
                  creator.brandsWorkedWith.map((brand, index) => (
                    <Link
                      key={brand.brandId}
                      href={`/brand/${brand.brandUsername}`}
                      className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all animate-fade-up group"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                    >
                      {/* Brand Logo */}
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

                      {/* Brand Info */}
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
                              <span className="text-[var(--border)]">·</span>
                              <span className="capitalize">{brand.brandCategory}</span>
                            </>
                          )}
                        </div>

                        {/* Collab Stats */}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
                            <Zap className="w-3 h-3" />
                            {brand.collabCount} {brand.collabCount === 1 ? "collab" : "collabs"}
                          </span>
                          {brand.postTypes.length > 0 && (
                            <div className="flex gap-1.5">
                              {brand.postTypes.slice(0, 3).map((type) => (
                                <span key={type} className="badge badge-muted capitalize text-xs">
                                  {type}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                    <Building2 className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
                    <p className="text-[var(--muted)]">No brand collaborations detected yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "similar" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {creator.similarCreators.length > 0 ? (
                  creator.similarCreators.map((similar) => (
                    <Link
                      key={similar.id}
                      href={`/creator/${similar.instagramUsername}`}
                      className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all group"
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
                  <div className="col-span-full text-center py-12 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                    <Sparkles className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
                    <p className="text-[var(--muted)]">No similar creators found</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Users className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Creator not found</h2>
            <p className="text-[var(--muted)] mb-4">
              This creator doesn&apos;t exist or hasn&apos;t been discovered yet.
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
