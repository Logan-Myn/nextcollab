"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Heart, Search, Loader2, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { BrandCard } from "@/components/brand-card";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BlurFade } from "@/components/ui/blur-fade";

interface CreatorProfile {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  profilePicture: string | null;
}

export default function SavedBrandsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const {
    savedBrands,
    isLoading,
    toggleSave,
    isSaved,
    isSaving,
    count,
  } = useFavorites(session?.user?.id);

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
    }
  };

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {/* Page Header */}
      <header className="mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl font-semibold tracking-tight">
                Saved <span className="italic text-primary">Brands</span>
              </h1>
              <p className="text-muted-foreground">
                {count > 0 ? (
                  <>
                    <NumberTicker value={count} className="text-foreground font-semibold" /> brands you&apos;re interested in
                  </>
                ) : (
                  "Brands you want to pitch later"
                )}
              </p>
            </div>
          </div>

          <Button asChild>
            <Link href="/brand">
              <Search className="w-4 h-4" />
              Discover More
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Loading your saved brands...</p>
          </div>
        </div>
      ) : savedBrands.length === 0 ? (
        <BlurFade delay={0.1}>
          <Card className="p-12 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No saved brands yet</h2>
            <p className="text-muted-foreground mb-6">
              Save brands you&apos;re interested in by clicking the heart icon on any brand card. They&apos;ll appear here for easy access when you&apos;re ready to pitch.
            </p>
            <Button size="lg" asChild>
              <Link href="/brand">
                Discover Brands
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>
        </BlurFade>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {savedBrands.map((brand, index) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              isSaved={isSaved(brand.id)}
              isSaving={isSaving(brand.id)}
              onSave={toggleSave}
              showMatchScore={false}
              index={index}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
