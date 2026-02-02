"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Search, Sparkles, Loader2, RefreshCw, ArrowRight, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { BrandCard, BrandCardCompact } from "@/components/brand-card";
import { DiscoveryFilters } from "@/components/brand/discovery-filters";
import { useDebounce } from "@/hooks/use-debounce";
import { useBrands, TabType, SortType, ViewMode, BrandFilters } from "@/hooks/use-brands";
import Link from "next/link";
import Image from "next/image";

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
    category: searchParams.get("category") || "",
    niche: searchParams.get("niche") || "",
    minFollowers: "",
    maxFollowers: "",
    activityLevel: searchParams.get("active") === "true" ? "veryActive" : (searchParams.get("activity") || ""),
    sort: (searchParams.get("sort") as SortType) || "matchScore",
    page: 1,
    verified: searchParams.get("verified") === "true",
  });

  // Smart filter states
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [activeOnly, setActiveOnly] = useState(searchParams.get("active") === "true");
  const [myNicheOnly, setMyNicheOnly] = useState(searchParams.get("myNiche") === "true");

  useEffect(() => {
    const range = searchParams.get("followers") || "";
    if (range) {
      const [min, max] = range.split("-");
      setFilters((f) => ({
        ...f,
        minFollowers: min || "",
        maxFollowers: max || "",
      }));
    }
  }, [searchParams]);

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
    categories,
    hasMore,
    loadMore,
  } = useBrands(filters, session?.user?.id);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.tab !== "all") params.set("tab", filters.tab);
    if (filters.search) params.set("q", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.minFollowers || filters.maxFollowers) {
      params.set("followers", `${filters.minFollowers}-${filters.maxFollowers}`);
    }
    if (filters.sort !== "matchScore") params.set("sort", filters.sort);
    if (verifiedOnly) params.set("verified", "true");
    if (activeOnly) params.set("active", "true");
    if (myNicheOnly) params.set("myNiche", "true");

    const newUrl = params.toString() ? `?${params.toString()}` : "/brand";
    router.replace(newUrl, { scroll: false });
  }, [filters, verifiedOnly, activeOnly, myNicheOnly, router]);

  const handleTabChange = (tab: TabType) => {
    setFilters((f) => ({ ...f, tab, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((f) => ({ ...f, category, page: 1 }));
  };

  const handleFollowerRangeChange = (range: string) => {
    const [min, max] = range.split("-");
    setFilters((f) => ({
      ...f,
      minFollowers: min || "",
      maxFollowers: max || "",
      page: 1,
    }));
  };

  const handleSortChange = (sort: SortType) => {
    setFilters((f) => ({ ...f, sort, page: 1 }));
  };

  const handleVerifiedOnlyChange = (value: boolean) => {
    setVerifiedOnly(value);
    setFilters((f) => ({ ...f, verified: value, page: 1 }));
  };

  const handleActiveOnlyChange = (value: boolean) => {
    setActiveOnly(value);
    // "Active this month" maps to activity level "veryActive"
    setFilters((f) => ({ ...f, activityLevel: value ? "veryActive" : "", page: 1 }));
  };

  const handleMyNicheOnlyChange = (value: boolean) => {
    setMyNicheOnly(value);
    if (value && profile?.niche) {
      setFilters((f) => ({ ...f, niche: profile.niche || "", page: 1 }));
    } else {
      setFilters((f) => ({ ...f, niche: "", page: 1 }));
    }
  };

  const topMatches = brands.filter((b) => (b.matchScore || 0) >= 70).slice(0, 6);
  const hasProfile = !!profile?.instagramUsername;

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {/* Editorial Page Header */}
      <header className="mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl lg:text-5xl font-semibold tracking-tight mb-3">
              Discover{" "}
              <span className="italic text-[var(--accent)]">brands</span>
            </h1>
            <p className="text-[var(--muted)] text-base lg:text-lg">
              <span className="font-semibold text-[var(--foreground)] tabular-nums">
                {formatNumber(pagination.total)}
              </span>{" "}
              brands actively sponsoring creators
            </p>
          </div>

          {/* Quick Stats Pill */}
          {hasProfile && brands.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-light)] rounded-full border border-[var(--accent)]/20">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--accent)]">
                {brands.filter((b) => (b.matchScore || 0) >= 85).length} excellent matches
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Search Bar - Editorial Style */}
      <div
        className={`relative mb-8 animate-fade-up opacity-0 transition-all duration-300 ${
          searchFocused ? "scale-[1.01]" : ""
        }`}
        style={{ animationDelay: "50ms", animationFillMode: "forwards" }}
      >
        <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
          searchFocused
            ? "ring-2 ring-[var(--accent)] shadow-[0_0_30px_rgba(131,58,180,0.15)]"
            : "ring-1 ring-[var(--border)]"
        }`}>
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            searchFocused ? "text-[var(--accent)]" : "text-[var(--muted)]"
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search brands, niches, or keywords..."
            className="w-full h-14 pl-14 pr-14 bg-[var(--surface)] text-base placeholder:text-[var(--muted)] focus:outline-none transition-all"
          />
          {isLoading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
            </div>
          )}
          {!isLoading && searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-all"
            >
              <span className="text-xs font-medium">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="animate-fade-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <DiscoveryFilters
          tab={filters.tab}
          onTabChange={handleTabChange}
          category={filters.category}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          followerRange={`${filters.minFollowers}-${filters.maxFollowers}`}
          onFollowerRangeChange={handleFollowerRangeChange}
          sort={filters.sort}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          matchCount={filters.tab === "forYou" ? brands.length : undefined}
          hasProfile={hasProfile}
          verifiedOnly={verifiedOnly}
          onVerifiedOnlyChange={handleVerifiedOnlyChange}
          activeOnly={activeOnly}
          onActiveOnlyChange={handleActiveOnlyChange}
          myNicheOnly={myNicheOnly}
          onMyNicheOnlyChange={handleMyNicheOnlyChange}
          userNiche={profile?.niche}
        />
      </div>

      {/* For You Carousel - Editorial Treatment */}
      {filters.tab === "forYou" && hasProfile && topMatches.length > 0 && (
        <section
          className="mb-10 animate-fade-up opacity-0"
          style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
        >
          {/* Section with gradient accent line */}
          <div className="relative p-6 lg:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60" />

            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl lg:text-2xl font-semibold mb-1">
                    Picked for{" "}
                    <span className="italic text-[var(--accent)]">
                      @{profile?.instagramUsername}
                    </span>
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    Based on {profile?.niche || "your content"} · {formatNumber(profile?.followers || 0)} followers
                  </p>
                </div>
              </div>
              <Link
                href="/brand?tab=forYou"
                className="group flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors whitespace-nowrap"
              >
                See all {brands.length}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Horizontal scroll carousel */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
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
                  <div className="p-5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl transition-all duration-300 hover:border-[var(--accent)] hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--accent)]/5">
                    {/* Avatar with glow on hover */}
                    <div className="relative mb-4">
                      {brand.profilePicture ? (
                        <Image
                          src={brand.profilePicture}
                          alt={brand.name}
                          width={56}
                          height={56}
                          unoptimized
                          className="w-14 h-14 rounded-xl object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center transition-transform group-hover:scale-105">
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

                    {/* Match Score - Visual bar */}
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
                              ? "bg-gradient-to-r from-[var(--success)] to-emerald-400"
                              : "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
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

      {/* Rising Brands Section - Show on "all" tab */}
      {filters.tab === "all" && !isLoading && brands.length > 0 && (
        <section
          className="mb-10 animate-fade-up opacity-0"
          style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--warning)]/5 to-transparent border border-[var(--warning)]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Rising Brands</h3>
                <p className="text-xs text-[var(--muted)]">New to sponsorships · Less competition</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {brands
                .filter((b) => (b.partnershipCount || 0) >= 1 && (b.partnershipCount || 0) <= 3)
                .slice(0, 3)
                .map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.instagramUsername || brand.id}`}
                    className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--warning)] transition-all group"
                  >
                    {brand.profilePicture ? (
                      <Image
                        src={brand.profilePicture}
                        alt={brand.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/20 flex items-center justify-center">
                        <span className="text-[var(--warning)] font-semibold">
                          {brand.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate group-hover:text-[var(--warning)] transition-colors">
                        {brand.name}
                      </h4>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {brand.category} · {formatNumber(brand.followers || 0)}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-[var(--warning)]/10 text-[var(--warning)] rounded-md">
                      New
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Content States */}
      {isLoading && brands.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-2xl animate-ping bg-[var(--accent)]/20" style={{ animationDuration: "1.5s" }} />
            </div>
            <p className="text-sm text-[var(--muted)]">Finding brands for you...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-[var(--error)]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">!</span>
            </div>
            <h3 className="font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm text-[var(--muted)] mb-5">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      ) : brands.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center mx-auto mb-5 border border-[var(--border)]">
              <Search className="w-9 h-9 text-[var(--muted)]" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold mb-2">
              No brands found
            </h2>
            <p className="text-[var(--muted)] mb-6">
              {filters.search
                ? `No results for "${filters.search}". Try a different search term.`
                : "Try adjusting your filters to see more results."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setVerifiedOnly(false);
                setActiveOnly(false);
                setMyNicheOnly(false);
                setFilters({
                  tab: "all",
                  search: "",
                  category: "",
                  niche: "",
                  minFollowers: "",
                  maxFollowers: "",
                  activityLevel: "",
                  sort: "matchScore",
                  page: 1,
                  verified: false,
                });
              }}
              className="btn btn-primary"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Section Header */}
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              {filters.tab === "forYou"
                ? "Your Matches"
                : filters.tab === "saved"
                  ? "Saved Brands"
                  : "All Brands"}
            </h2>
            <span className="text-sm text-[var(--muted)] tabular-nums">
              {brands.length} of {formatNumber(pagination.total)}
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
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand, index) => (
                <BrandCardCompact key={brand.id} brand={brand} index={index} />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="group inline-flex items-center gap-2 px-8 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Brands
                    <span className="text-xs text-[var(--muted)] group-hover:text-[var(--accent)]">
                      ({pagination.total - brands.length} remaining)
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
