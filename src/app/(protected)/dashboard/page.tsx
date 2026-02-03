"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  Users,
  Target,
  Zap,
  Instagram,
  Loader2,
  ChevronRight,
  Kanban,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { BrandCard, BrandCardCompact, BrandData } from "@/components/brand-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BlurFade } from "@/components/ui/blur-fade";

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

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getCreatorTier(followers: number): string {
  if (followers >= 1000000) return "Mega";
  if (followers >= 100000) return "Macro";
  if (followers >= 10000) return "Mid-tier";
  if (followers >= 1000) return "Micro";
  return "Nano";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [matches, setMatches] = useState<BrandData[]>([]);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);

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
  const topMatches = matches.slice(0, 6);
  const excellentMatches = matches.filter((m) => (m.matchScore || 0) >= 85);

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
          {/* Stats Overview - Compact header */}
          <section className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <BlurFade delay={0}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[var(--accent-secondary)]" />
                    <span className="text-xs text-muted-foreground">Followers</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    {profile.followers ? (
                      <NumberTicker value={profile.followers} className="text-foreground" />
                    ) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getCreatorTier(profile.followers || 0)} creator
                  </p>
                </Card>
              </BlurFade>

              <BlurFade delay={0.05}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                    <span className="text-xs text-muted-foreground">Engagement</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    {profile.engagementRate ? (
                      <>
                        <NumberTicker value={Number(profile.engagementRate)} decimalPlaces={1} className="text-foreground" />%
                      </>
                    ) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.engagementRate
                      ? Number(profile.engagementRate) >= 3
                        ? "Above average"
                        : "Room to grow"
                      : "Calculating..."}
                  </p>
                </Card>
              </BlurFade>

              <BlurFade delay={0.1}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Niche</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight capitalize">
                    {profile.niche || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.niche ? "Detected from content" : "Not detected yet"}
                  </p>
                </Card>
              </BlurFade>

              <BlurFade delay={0.15}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[var(--warning)]" />
                    <span className="text-xs text-muted-foreground">Matches</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    <NumberTicker value={matchStats?.total || 0} className="text-foreground" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {matchStats?.excellent || 0} excellent fits
                  </p>
                </Card>
              </BlurFade>
            </div>
          </section>

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

          {/* Pipeline + Trending */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pipeline Preview */}
            <BlurFade delay={0.3}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-primary" />
                    <h2 className="font-semibold text-sm">Your Pipeline</h2>
                  </div>
                  <Link
                    href="/dashboard/pipeline"
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    Manage
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  {[
                    { label: "Saved", count: 0, color: "var(--muted)" },
                    { label: "Pitched", count: 0, color: "var(--accent-secondary)" },
                    { label: "Talking", count: 0, color: "var(--warning)" },
                    { label: "Won", count: 0, color: "var(--success)" },
                  ].map((stage) => (
                    <div
                      key={stage.label}
                      className="p-3 rounded-lg bg-secondary"
                    >
                      <p
                        className="text-lg font-bold mb-0.5"
                        style={{ color: stage.color }}
                      >
                        {stage.count}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">{stage.label}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    Track your outreach progress
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/pipeline">Open Pipeline</Link>
                  </Button>
                </div>
              </Card>
            </BlurFade>

            {/* Trending Brands */}
            <BlurFade delay={0.35}>
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
                      <BrandCardCompact key={brand.id} brand={brand} index={index} />
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
