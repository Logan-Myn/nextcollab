"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Search,
  Sparkles,
  Loader2,
  Heart,
  ExternalLink,
  Users,
  TrendingUp,
  SlidersHorizontal,
  X,
  BadgeCheck,
  Zap,
  ArrowRight,
  LayoutGrid,
  List,
  Star,
  Flame,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useDebounce } from "@/hooks/use-debounce";
import { useBrands, TabType, SortType, ViewMode, BrandFilters, CreatorTier } from "@/hooks/use-brands";
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

const CATEGORIES = [
  "Fashion", "Beauty", "Fitness", "Food", "Tech", "Travel", "Lifestyle", "Gaming"
];

const CREATOR_TIERS = [
  { label: "Any size", value: "" },
  { label: "Nano (<10K)", value: "nano" },
  { label: "Micro (10K-50K)", value: "micro" },
  { label: "Mid (50K-100K)", value: "mid" },
  { label: "Macro (100K-500K)", value: "macro" },
  { label: "Mega (500K+)", value: "mega" },
];

export default function GlassmorphismDesign() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filters, setFilters] = useState<BrandFilters>({
    tab: (searchParams.get("tab") as TabType) || "all",
    search: searchParams.get("q") || "",
    activityLevel: searchParams.get("activityLevel") || "",
    creatorTier: (searchParams.get("creatorTier") as CreatorTier) || "",
    niche: searchParams.get("niche") || "",
    hasWebsite: searchParams.get("hasWebsite") === "true",
    sort: (searchParams.get("sort") as SortType) || "matchScore",
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
    hasMore,
    loadMore,
  } = useBrands(filters, session?.user?.id);

  const hasProfile = !!profile?.instagramUsername;
  const topMatches = brands.filter((b) => (b.matchScore || 0) >= 70).slice(0, 5);

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {/* Glassmorphism Design - Vibrant Background with Frosted Glass */}
      <div className="min-h-screen relative">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="mb-10 relative">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">AI-Powered Matching</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Find Your
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Perfect Brand
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-md">
              Discover {formatNumber(pagination.total)} brands ready to collaborate with creators like you
            </p>
          </div>
        </header>

        {/* Search & Filters - Glass Card */}
        <div className="mb-8 p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands, niches, categories..."
                className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur rounded-2xl text-white placeholder:text-white/40 border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/15 transition-all"
              />
              {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 animate-spin" />
              )}
            </div>

            {/* Filter Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Creator Tier Filter */}
              <div className="relative group">
                <button className="h-14 px-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-white font-medium hover:bg-white/15 hover:border-white/20 transition-all flex items-center gap-2">
                  {filters.creatorTier ? CREATOR_TIERS.find(t => t.value === filters.creatorTier)?.label : "Works with"}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {CREATOR_TIERS.map((tier) => (
                    <button
                      key={tier.value}
                      onClick={() => setFilters(f => ({ ...f, creatorTier: tier.value as CreatorTier }))}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10 transition-all ${filters.creatorTier === tier.value ? "bg-white/10" : ""}`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Has Website Toggle */}
              <button
                onClick={() => setFilters(f => ({ ...f, hasWebsite: !f.hasWebsite }))}
                className={`h-14 px-5 rounded-2xl backdrop-blur border font-medium transition-all flex items-center gap-2 ${
                  filters.hasWebsite
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-white"
                    : "bg-white/10 border-white/10 text-white hover:bg-white/15"
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                Has Website
              </button>

              {/* View Toggle */}
              <div className="flex bg-white/10 backdrop-blur rounded-2xl p-1.5 border border-white/10">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    viewMode === "grid" ? "bg-white text-purple-900" : "text-white/60 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    viewMode === "list" ? "bg-white text-purple-900" : "text-white/60 hover:text-white"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10">
            {[
              { id: "all", label: "Explore All", icon: null },
              { id: "forYou", label: "For You", icon: <Sparkles className="w-4 h-4" /> },
              { id: "saved", label: "Saved", icon: <Heart className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilters(f => ({ ...f, tab: tab.id as TabType }))}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filters.tab === tab.id
                    ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/25"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Matches Carousel */}
        {filters.tab === "forYou" && hasProfile && topMatches.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Hot Matches</h2>
                  <p className="text-sm text-white/50">Best opportunities for your profile</p>
                </div>
              </div>
              <Link href="/brand?tab=forYou" className="flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition-colors">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-none">
              {topMatches.map((brand, index) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.instagramUsername || brand.id}`}
                  className="group flex-shrink-0 w-64 snap-start cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="flex items-start justify-between mb-4">
                      {brand.profilePicture ? (
                        <Image
                          src={brand.profilePicture}
                          alt={brand.name}
                          width={56}
                          height={56}
                          unoptimized
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/20"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">{brand.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        (brand.matchScore || 0) >= 85
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                          : "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
                      }`}>
                        <Star className="w-3 h-3" />
                        {brand.matchScore}%
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-1 truncate group-hover:text-pink-300 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-white/50 mb-4 truncate">@{brand.instagramUsername}</p>

                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {formatNumber(brand.followers || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {brand.partnershipCount || 0} collabs
                      </span>
                    </div>

                    {/* Match Bar */}
                    <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
                        style={{ width: `${brand.matchScore || 0}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Main Content */}
        {isLoading && brands.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-3xl animate-ping bg-purple-500/20" style={{ animationDuration: "2s" }} />
              </div>
              <p className="text-white/60">Discovering brands...</p>
            </div>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-6 border border-white/20">
                <Search className="w-12 h-12 text-white/40" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No brands found</h2>
              <p className="text-white/50 mb-8">Try adjusting your filters to discover more opportunities</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    tab: "all",
                    search: "",
                    activityLevel: "",
                    creatorTier: "",
                    niche: "",
                    hasWebsite: false,
                    sort: "matchScore",
                    page: 1,
                  });
                }}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-2xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/25"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {filters.tab === "forYou" ? "All Matches" : filters.tab === "saved" ? "Saved" : "Explore"}
              </h2>
              <span className="text-sm text-white/40 tabular-nums">
                {brands.length} of {formatNumber(pagination.total)} brands
              </span>
            </div>

            {/* Grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {brands.map((brand, index) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.instagramUsername || brand.id}`}
                    className="group cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {brand.profilePicture ? (
                            <Image
                              src={brand.profilePicture}
                              alt={brand.name}
                              width={52}
                              height={52}
                              unoptimized
                              className="w-13 h-13 rounded-2xl object-cover ring-2 ring-white/10"
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-bold text-xl">{brand.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-white flex items-center gap-1.5 group-hover:text-pink-300 transition-colors">
                              {brand.name}
                              {brand.isVerifiedAccount && (
                                <BadgeCheck className="w-4 h-4 text-cyan-400" />
                              )}
                            </h3>
                            <p className="text-sm text-white/50">@{brand.instagramUsername}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-pink-400 hover:bg-white/10 transition-all"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {brand.category && (
                          <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium text-white/70">
                            {brand.category}
                          </span>
                        )}
                        {(brand.partnershipCount || 0) > 0 && (
                          <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-xs font-medium text-green-400 border border-green-500/20">
                            {brand.partnershipCount} collabs
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4 text-sm text-white/40">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {formatNumber(brand.followers || 0)}
                          </span>
                        </div>
                        {brand.matchScore && brand.matchScore > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  brand.matchScore >= 85
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : "bg-gradient-to-r from-purple-400 to-pink-500"
                                }`}
                                style={{ width: `${brand.matchScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-white">{brand.matchScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {brands.map((brand, index) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.instagramUsername || brand.id}`}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 transition-all hover:bg-white/15 hover:border-white/30 cursor-pointer"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {brand.profilePicture ? (
                      <Image
                        src={brand.profilePicture}
                        alt={brand.name}
                        width={44}
                        height={44}
                        unoptimized
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-semibold">{brand.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate group-hover:text-pink-300 transition-colors">
                        {brand.name}
                      </h4>
                      <p className="text-sm text-white/50 truncate">
                        {brand.category || brand.niche} · {formatNumber(brand.followers || 0)}
                      </p>
                    </div>
                    {brand.matchScore && brand.matchScore > 0 && (
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        brand.matchScore >= 85
                          ? "bg-green-500/20 text-green-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {brand.matchScore}%
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-pink-400 hover:bg-white/10 transition-all"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-medium hover:bg-white/15 hover:border-white/30 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Brands
                      <span className="text-white/50">({pagination.total - brands.length} left)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
