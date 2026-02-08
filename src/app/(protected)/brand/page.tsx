"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Search, Sparkles, Loader2, RefreshCw, ArrowRight, Command, X, Flame } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { BrandCard, BrandCardCompact } from "@/components/brand-card";
import { DiscoveryFilters } from "@/components/brand/discovery-filters";
import { useDebounce } from "@/hooks/use-debounce";
import { useBrands, TabType, SortType, ViewMode, BrandFilters, CreatorTier } from "@/hooks/use-brands";
import { useFavorites } from "@/hooks/use-favorites";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CreatorProfile {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  profilePicture: string | null;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function BrandDiscoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filters, setFilters] = useState<BrandFilters>({
    tab: (searchParams.get("tab") as TabType) || "all",
    search: searchParams.get("q") || "",
    activityLevel: searchParams.get("activity") || "",
    creatorTier: (searchParams.get("tier") as CreatorTier) || "",
    niche: searchParams.get("niche") || "",
    hasWebsite: searchParams.get("hasWebsite") === "true",
    sort: (searchParams.get("sort") as SortType) || "partnershipCount",
    page: 1,
  });

  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

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

  const {
    brands,
    isLoading,
    error,
    pagination,
    creatorNiches,
    hasMore,
    loadMore,
    refetch,
  } = useBrands(filters, session?.user?.id);

  // Favorites functionality
  const { toggleSave, isSaved, isSaving } = useFavorites(session?.user?.id);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.tab !== "all") params.set("tab", filters.tab);
    if (filters.search) params.set("q", filters.search);
    if (filters.activityLevel) params.set("activity", filters.activityLevel);
    if (filters.creatorTier) params.set("tier", filters.creatorTier);
    if (filters.niche) params.set("niche", filters.niche);
    if (filters.hasWebsite) params.set("hasWebsite", "true");
    if (filters.sort !== "partnershipCount") params.set("sort", filters.sort);

    const newUrl = params.toString() ? `?${params.toString()}` : "/brand";
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  const handleTabChange = (tab: TabType) => {
    setFilters((f) => ({ ...f, tab, page: 1 }));
  };

  const handleActivityLevelChange = (activityLevel: string) => {
    setFilters((f) => ({ ...f, activityLevel, page: 1 }));
  };

  const handleCreatorTierChange = (creatorTier: CreatorTier) => {
    setFilters((f) => ({ ...f, creatorTier, page: 1 }));
  };

  const handleNicheChange = (niche: string) => {
    setFilters((f) => ({ ...f, niche, page: 1 }));
  };

  const handleHasWebsiteChange = (hasWebsite: boolean) => {
    setFilters((f) => ({ ...f, hasWebsite, page: 1 }));
  };

  const handleSortChange = (sort: SortType) => {
    setFilters((f) => ({ ...f, sort, page: 1 }));
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const topMatches = brands.filter((b) => (b.matchScore || 0) >= 70).slice(0, 6);
  const hasProfile = !!profile?.instagramUsername;
  const excellentMatchCount = brands.filter((b) => (b.matchScore || 0) >= 85).length;

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && searchFocused) {
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchFocused]);

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {/* Page Header */}
      <header className="relative mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <h1 className="font-[family-name:var(--font-display)] text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              Discover{" "}
              <span className="gradient-text italic">brands</span>
            </h1>
            <p className="text-[var(--muted)] text-base lg:text-lg flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--foreground)] tabular-nums">
                {formatNumber(pagination.total)}
              </span>
              brands actively sponsoring creators
            </p>
          </div>

          {/* Stats Pills */}
          {hasProfile && brands.length > 0 && excellentMatchCount > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)] leading-tight tabular-nums">
                  {excellentMatchCount} excellent {excellentMatchCount === 1 ? "match" : "matches"}
                </p>
                <p className="text-[0.6875rem] text-[var(--muted)] leading-tight">Based on your profile</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div
        className="relative mb-8 animate-fade-up opacity-0"
        style={{ animationDelay: "50ms", animationFillMode: "forwards" }}
      >
        <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
          searchFocused
            ? "ring-2 ring-[var(--accent)] shadow-[var(--shadow-accent)]"
            : "ring-1 ring-[var(--border)] shadow-[var(--shadow-sm)]"
        }`}>
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            searchFocused ? "text-[var(--accent)]" : "text-[var(--muted)]"
          }`} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search brands, niches, or keywords..."
            className="w-full h-14 pl-14 pr-32 bg-[var(--surface)] text-base placeholder:text-[var(--muted)] focus:outline-none transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading && (
              <Loader2 className="w-4.5 h-4.5 text-[var(--accent)] animate-spin" />
            )}
            {!isLoading && searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {!searchFocused && !searchQuery && (
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[0.6875rem] font-medium text-[var(--muted)] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg">
                <Command className="w-3 h-3" />K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="animate-fade-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <DiscoveryFilters
          tab={filters.tab}
          onTabChange={handleTabChange}
          activityLevel={filters.activityLevel}
          onActivityLevelChange={handleActivityLevelChange}
          creatorTier={filters.creatorTier}
          onCreatorTierChange={handleCreatorTierChange}
          niche={filters.niche}
          onNicheChange={handleNicheChange}
          creatorNiches={creatorNiches}
          hasWebsite={filters.hasWebsite}
          onHasWebsiteChange={handleHasWebsiteChange}
          sort={filters.sort}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          matchCount={filters.tab === "forYou" ? brands.length : undefined}
          hasProfile={hasProfile}
          userNiche={profile?.niche}
          userFollowers={profile?.followers}
        />
      </div>

      {/* For You Carousel */}
      {filters.tab === "forYou" && hasProfile && topMatches.length > 0 && (
        <section
          className="mb-10 animate-fade-up opacity-0"
          style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
        >
          <div className="relative p-6 lg:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-[image:var(--gradient-brand)] opacity-50" />

            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[image:var(--gradient-brand)] flex items-center justify-center shadow-[var(--shadow-accent)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl lg:text-2xl font-bold leading-tight">
                    Picked for{" "}
                    <span className="gradient-text italic">
                      @{profile?.instagramUsername}
                    </span>
                  </h2>
                  <p className="text-sm text-[var(--muted)] mt-0.5">
                    Based on {profile?.niche || "your content"} · {formatNumber(profile?.followers || 0)} followers
                  </p>
                </div>
              </div>
              <Link
                href="/brand?tab=forYou"
                className="group flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors whitespace-nowrap"
              >
                See all {brands.length}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Horizontal scroll carousel */}
            <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
              {topMatches.map((brand, index) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.instagramUsername || brand.id}`}
                  className="group flex-shrink-0 w-52 snap-start"
                  style={{
                    animation: `fade-up 0.4s ease-out forwards`,
                    animationDelay: `${200 + index * 60}ms`,
                    opacity: 0
                  }}
                >
                  <div className="relative p-5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl transition-all duration-300 hover:border-[var(--accent)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      {brand.profilePicture ? (
                        <Image
                          src={brand.profilePicture}
                          alt={brand.name}
                          width={56}
                          height={56}
                          unoptimized
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-[var(--border)] group-hover:ring-[var(--accent)] transition-all"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[image:var(--gradient-brand)] flex items-center justify-center ring-2 ring-transparent group-hover:ring-[var(--accent)] transition-all">
                          <span className="text-white font-bold text-xl">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {brand.isVerifiedAccount && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--accent-secondary)] rounded-full flex items-center justify-center border-2 border-[var(--surface-elevated)]">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Brand info */}
                    <h3 className="font-semibold text-sm truncate mb-0.5 group-hover:text-[var(--accent)] transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mb-4 truncate">
                      @{brand.instagramUsername}
                    </p>

                    {/* Match Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${
                          (brand.matchScore || 0) >= 85 ? "text-[var(--success)]" : "text-[var(--accent)]"
                        }`}>
                          {(brand.matchScore || 0) >= 85 ? "Excellent" : "Strong"} match
                        </span>
                        <span className="font-bold tabular-nums">
                          {brand.matchScore}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (brand.matchScore || 0) >= 85
                              ? "bg-[var(--success)]"
                              : "bg-[image:var(--gradient-brand)]"
                          }`}
                          style={{ width: `${brand.matchScore || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rising Brands Section */}
      {filters.tab === "all" && !isLoading && brands.length > 0 && (() => {
        const risingBrands = brands
          .filter((b) => (b.partnershipCount || 0) >= 1 && (b.partnershipCount || 0) <= 3)
          .slice(0, 3);
        if (risingBrands.length === 0) return null;
        return (
          <section
            className="mb-10 animate-fade-up opacity-0"
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            <div className="relative p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--warning)] to-transparent opacity-50" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--warning-light)] flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight">Rising Brands</h3>
                    <p className="text-xs text-[var(--muted)]">New to sponsorships · Less competition</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {risingBrands.map((brand, idx) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.instagramUsername || brand.id}`}
                    className="flex items-center gap-3.5 p-3.5 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] hover:border-[var(--warning)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 group"
                    style={{
                      animation: `fade-up 0.35s ease-out forwards`,
                      animationDelay: `${250 + idx * 60}ms`,
                      opacity: 0
                    }}
                  >
                    {brand.profilePicture ? (
                      <Image
                        src={brand.profilePicture}
                        alt={brand.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-[var(--border)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--warning-light)] flex items-center justify-center">
                        <span className="text-[var(--warning)] font-bold text-sm">
                          {brand.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate group-hover:text-[var(--warning)] transition-colors">
                        {brand.name}
                      </h4>
                      <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                        {brand.category || brand.niche || "Brand"} · {formatNumber(brand.followers || 0)} followers
                      </p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-widest bg-[var(--warning-light)] text-[var(--warning)] rounded-md">
                      New
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Content States */}
      {isLoading && brands.length === 0 ? (
        <div className="flex items-center justify-center py-28">
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-[var(--accent)] animate-spin" />
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-[var(--accent-light)] animate-pulse-soft" style={{ animationDuration: "2s" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">Finding brands for you</p>
              <p className="text-xs text-[var(--muted)]">This may take a moment...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-28">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-[var(--error-light)] flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="w-7 h-7 text-[var(--error)]" />
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">Something went wrong</h3>
            <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      ) : brands.length === 0 ? (
        <div className="flex items-center justify-center py-28">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center mx-auto mb-6 border border-[var(--border)]">
              <Search className="w-8 h-8 text-[var(--muted)]" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
              No brands found
            </h2>
            <p className="text-[var(--muted)] text-sm mb-6 leading-relaxed">
              {filters.search
                ? `No results for "${filters.search}". Try a different search term.`
                : "Try adjusting your filters to see more results."}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilters({
                  tab: "all",
                  search: "",
                  activityLevel: "",
                  creatorTier: "",
                  niche: "",
                  hasWebsite: false,
                  sort: "partnershipCount",
                  page: 1,
                });
              }}
            >
              Reset All Filters
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Results Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                {filters.tab === "forYou"
                  ? "Your Matches"
                  : filters.tab === "saved"
                    ? "Saved Brands"
                    : "All Brands"}
              </h2>
              <span className="px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--muted)] bg-[var(--surface-elevated)] rounded-lg border border-[var(--border)]">
                {formatNumber(pagination.total)}
              </span>
            </div>
            <span className="text-xs text-[var(--muted)] tabular-nums">
              Showing {brands.length} of {formatNumber(pagination.total)}
            </span>
          </div>

          {/* Brand Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {brands.map((brand, index) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  showMatchScore={filters.tab === "forYou" || (brand.matchScore || 0) > 0}
                  isSaved={isSaved(brand.id)}
                  isSaving={isSaving(brand.id)}
                  onSave={toggleSave}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand, index) => (
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
          )}

          {/* Load More */}
          {hasMore && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                disabled={isLoading}
                className="group min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Brands"
                )}
              </Button>
              <p className="text-xs text-[var(--muted)] tabular-nums">
                {pagination.total - brands.length} more {pagination.total - brands.length === 1 ? "brand" : "brands"} to explore
              </p>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
