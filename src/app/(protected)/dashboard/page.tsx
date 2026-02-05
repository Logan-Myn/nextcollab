"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  Instagram,
  Loader2,
  ChevronRight,
  HeartHandshake,
  Clock,
  MessageSquare,
  Rocket,
  Trophy,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { BrandCard, BrandCardCompact, BrandData } from "@/components/brand-card";
import { useFavorites } from "@/hooks/use-favorites";
import { useOutreach } from "@/hooks/use-outreach";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import type { LucideIcon } from "lucide-react";

interface CreatorProfile {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  bio: string | null;
  profilePicture: string | null;
  lastSyncedAt: string | null;
}

interface MatchStats {
  total: number;
  excellent: number;
  good: number;
  creatorNiche: string | null;
  creatorFollowers: number | null;
}

interface Nudge {
  id: string;
  icon: LucideIcon;
  text: string;
  href?: string;
  cta?: string;
  colorClass: string;
  iconBg: string;
}

function generateNudges(
  savedBrandIds: Set<string>,
  outreachRecords: { brandId: string; status: string; pitchedAt: string | null; brand?: BrandData }[],
  outreachStats: Record<string, number>,
  matchStats: MatchStats | null
): Nudge[] {
  const nudges: Nudge[] = [];
  const outreachBrandIds = new Set(outreachRecords.map((r) => r.brandId));

  // 1. Stale pitch (highest priority)
  const stalePitches = outreachRecords.filter((r) => {
    if (r.status !== "pitched" || !r.pitchedAt) return false;
    const daysSince = (Date.now() - new Date(r.pitchedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 3;
  });
  if (stalePitches.length > 0) {
    const stale = stalePitches[0];
    const days = Math.floor((Date.now() - new Date(stale.pitchedAt!).getTime()) / (1000 * 60 * 60 * 24));
    const brandName = stale.brand?.instagramUsername
      ? `@${stale.brand.instagramUsername}`
      : "A brand";
    nudges.push({
      id: "stale-pitch",
      icon: Clock,
      text: `${brandName} hasn't responded in ${days} days`,
      href: "/dashboard/pipeline",
      cta: "Check pipeline",
      colorClass: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-950/50",
    });
  }

  // 2. Saved not pitched
  const savedNotPitched = Array.from(savedBrandIds).filter((id) => !outreachBrandIds.has(id));
  if (savedNotPitched.length > 0) {
    nudges.push({
      id: "saved-not-pitched",
      icon: HeartHandshake,
      text: `You saved ${savedNotPitched.length} brand${savedNotPitched.length > 1 ? "s" : ""} — ready to pitch?`,
      href: "/dashboard/saved",
      cta: "View saved",
      colorClass: "text-[var(--accent)]",
      iconBg: "bg-[var(--accent-light)]",
    });
  }

  // 3. Active negotiations
  if (outreachStats.negotiating > 0) {
    nudges.push({
      id: "negotiations",
      icon: MessageSquare,
      text: `${outreachStats.negotiating} active negotiation${outreachStats.negotiating > 1 ? "s" : ""}`,
      href: "/dashboard/pipeline",
      cta: "View pipeline",
      colorClass: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-950/50",
    });
  }

  // 4. Excellent matches
  if (matchStats && matchStats.excellent > 0) {
    nudges.push({
      id: "excellent-matches",
      icon: Sparkles,
      text: `${matchStats.excellent} excellent brand match${matchStats.excellent > 1 ? "es" : ""} for you`,
      href: "/brand?tab=forYou",
      cta: "Explore",
      colorClass: "text-[var(--accent)]",
      iconBg: "bg-[var(--accent-light)]",
    });
  }

  // 5. Won deals
  if (outreachStats.completed > 0) {
    nudges.push({
      id: "won-deals",
      icon: Trophy,
      text: `${outreachStats.completed} deal${outreachStats.completed > 1 ? "s" : ""} completed — nice work!`,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
    });
  }

  // 6. Empty state (only if nothing else)
  if (nudges.length === 0 && outreachRecords.length === 0 && savedBrandIds.size === 0) {
    nudges.push({
      id: "empty",
      icon: Rocket,
      text: "Start pitching — your first brand deal awaits",
      href: "/brand",
      cta: "Find brands",
      colorClass: "text-[var(--accent)]",
      iconBg: "bg-[var(--accent-light)]",
    });
  }

  return nudges.slice(0, 3);
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [matches, setMatches] = useState<BrandData[]>([]);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Pipeline data
  const { savedBrandIds, toggleSave, isSaved, isSaving } = useFavorites(session?.user?.id);
  const { stats: outreachStats, records: outreachRecords } = useOutreach(session?.user?.id);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(
        `/api/instagram/me?userId=${encodeURIComponent(session.user.id)}`
      );
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

  const fetchMatches = useCallback(async () => {
    if (!session?.user?.id) return;

    setMatchesLoading(true);
    try {
      const res = await fetch(
        `/api/brands/matches?userId=${encodeURIComponent(session.user.id)}`
      );
      if (res.ok) {
        const json = await res.json();
        setMatches(json.data || []);
        setMatchStats(json.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setMatchesLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.instagramUsername) {
      fetchMatches();
    }
  }, [profile?.instagramUsername, fetchMatches]);

  const handleResync = async () => {
    if (!profile?.instagramUsername || !session?.user?.id) return;

    const res = await fetch(
      `/api/instagram/profile?username=${encodeURIComponent(profile.instagramUsername)}`
    );
    if (res.ok) {
      const json = await res.json();
      await fetch("/api/instagram/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          profile: json.data,
        }),
      });
      await fetchProfile();
      await fetchMatches();
    }
  };

  const hasProfile = profile?.instagramUsername;
  const topMatches = matches.slice(0, 3);
  const excellentMatches = matches.filter((m) => (m.matchScore || 0) >= 85);

  const nudges = useMemo(
    () => generateNudges(savedBrandIds, outreachRecords, outreachStats, matchStats),
    [savedBrandIds, outreachRecords, outreachStats, matchStats]
  );

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {profileLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
        </div>
      ) : hasProfile ? (
        <>
          {/* Smart Nudges */}
          {nudges.length > 0 && (
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nudges.map((nudge, index) => (
                  <BlurFade key={nudge.id} delay={index * 0.05}>
                    <Card className="group relative overflow-hidden px-4 py-3.5 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div
                          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${nudge.iconBg} transition-transform duration-200 group-hover:scale-105`}
                        >
                          <nudge.icon className={`w-4.5 h-4.5 ${nudge.colorClass}`} />
                        </div>
                        <p className="flex-1 text-sm font-medium text-foreground leading-snug min-w-0">
                          {nudge.text}
                        </p>
                        {nudge.href && nudge.cta && (
                          <Link
                            href={nudge.href}
                            className={`shrink-0 text-xs font-semibold ${nudge.colorClass} hover:opacity-80 transition-opacity flex items-center gap-1`}
                          >
                            {nudge.cta}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </Card>
                  </BlurFade>
                ))}
              </div>
            </section>
          )}

          {/* Brand Matches - Main content */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                <h2 className="text-lg font-semibold">
                  {excellentMatches.length > 0
                    ? `${excellentMatches.length} Great Matches`
                    : "Your Matches"}
                </h2>
              </div>
              <Link
                href="/brand?tab=forYou"
                className="flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors text-sm font-medium"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {matchesLoading ? (
              <div className="flex items-center justify-center py-16 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                  <span className="text-sm text-[var(--muted)]">
                    Finding your best matches...
                  </span>
                </div>
              </div>
            ) : matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topMatches.map((brand, index) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    showMatchScore={true}
                    isSaved={isSaved(brand.id)}
                    isSaving={isSaving(brand.id)}
                    onSave={toggleSave}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-10 text-center">
                <div className="w-14 h-14 rounded-xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-bold mb-2">Building your matches</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
                  We&apos;re analyzing brands to find the best opportunities for
                  you. Check back soon!
                </p>
                <Button asChild>
                  <Link href="/brand">Browse All Brands</Link>
                </Button>
              </Card>
            )}
          </section>

          {/* Trending Brands */}
          <section>
            <BlurFade delay={0.3}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--accent-secondary)]" />
                    <h2 className="font-semibold text-sm">
                      {profile.niche
                        ? `Trending in ${profile.niche}`
                        : "Trending Brands"}
                    </h2>
                  </div>
                  <Link
                    href="/brand"
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    Explore
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {matches.length > 0 ? (
                  <div className="space-y-2">
                    {matches.slice(0, 4).map((brand, index) => (
                      <BrandCardCompact
                        key={brand.id}
                        brand={brand}
                        index={index}
                        isSaved={isSaved(brand.id)}
                        isSaving={isSaving(brand.id)}
                        onSave={toggleSave}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-secondary flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Discovering trending brands...
                    </p>
                  </div>
                )}
              </Card>
            </BlurFade>
          </section>
        </>
      ) : (
        /* Empty State: No Profile */
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-10 text-center max-w-md">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-5">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              Connect Your Instagram
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Add your Instagram username to unlock AI-powered brand matches
              tailored to your content and audience.
            </p>
            <Button asChild>
              <Link href="/onboarding">
                <Instagram className="w-5 h-5" />
                Get Started
              </Link>
            </Button>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
