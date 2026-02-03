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
  Filter,
  X,
  ChevronDown,
  BadgeCheck,
  Zap,
  ArrowUpRight,
  Grid3X3,
  LayoutList,
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
  { name: "Fashion", icon: "👗" },
  { name: "Beauty", icon: "💄" },
  { name: "Fitness", icon: "💪" },
  { name: "Food", icon: "🍕" },
  { name: "Tech", icon: "💻" },
  { name: "Travel", icon: "✈️" },
  { name: "Lifestyle", icon: "🌟" },
  { name: "Gaming", icon: "🎮" },
];


export default function BentoGridDesign() {
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
    category: searchParams.get("category") || "",
    activityLevel: searchParams.get("activityLevel") || "",
    creatorTier: (searchParams.get("creatorTier") as CreatorTier) || "",
    sponsorsNiche: searchParams.get("sponsorsNiche") || "",
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
    categories,
    hasMore,
    loadMore,
  } = useBrands(filters, session?.user?.id);

  const hasProfile = !!profile?.instagramUsername;
  const topMatches = brands.filter((b) => (b.matchScore || 0) >= 70).slice(0, 4);
  const activeFilterCount = [filters.category, filters.creatorTier, filters.sponsorsNiche, filters.hasWebsite].filter(Boolean).length;

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {/* Bento Grid Design - Apple Style */}
      <div className="min-h-screen bg-[#F5F5F7]">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-[#1D1D1F]">
              Discover Brands
            </h1>
            <p className="text-lg text-[#86868B]">
              {formatNumber(pagination.total)} brands ready to collaborate
            </p>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl text-[#1D1D1F] placeholder:text-[#86868B] border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 transition-all"
            />
          </div>

          {/* Filter & View Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 px-5 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                showFilters || activeFilterCount > 0
                  ? "bg-[#1D1D1F] text-white"
                  : "bg-white text-[#1D1D1F] hover:bg-[#E8E8ED]"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex bg-white rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  viewMode === "grid" ? "bg-[#1D1D1F] text-white" : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  viewMode === "list" ? "bg-[#1D1D1F] text-white" : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel (Expandable) */}
        {showFilters && (
          <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[#1D1D1F]">Filter Options</h3>
              <button
                onClick={() => {
                  setFilters(f => ({ ...f, category: "", creatorTier: "", sponsorsNiche: "", hasWebsite: false }));
                }}
                className="text-sm text-[#0071E3] hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-3">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setFilters(f => ({ ...f, category: f.category === cat.name ? "" : cat.name }))}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        filters.category === cat.name
                          ? "bg-[#1D1D1F] text-white"
                          : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]"
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Tier */}
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-3">Works with</label>
                <select
                  value={filters.creatorTier}
                  onChange={(e) => setFilters(f => ({ ...f, creatorTier: e.target.value as CreatorTier }))}
                  className="w-full h-11 px-4 bg-[#F5F5F7] rounded-xl text-[#1D1D1F] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                >
                  <option value="">All creator sizes</option>
                  <option value="nano">Nano (&lt;10K)</option>
                  <option value="micro">Micro (10K-50K)</option>
                  <option value="mid">Mid (50K-100K)</option>
                  <option value="macro">Macro (100K-500K)</option>
                  <option value="mega">Mega (500K+)</option>
                </select>
              </div>

              {/* Quick Toggles */}
              <div>
                <label className="block text-sm font-medium text-[#86868B] mb-3">Quick Filters</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilters(f => ({ ...f, hasWebsite: !f.hasWebsite }))}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      filters.hasWebsite ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#1D1D1F]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Has Website
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 ${filters.hasWebsite ? "bg-white border-white" : "border-[#86868B]"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          {["all", "forYou", "saved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilters(f => ({ ...f, tab: tab as TabType }))}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                filters.tab === tab
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#1D1D1F] hover:bg-white"
              }`}
            >
              {tab === "all" && "All Brands"}
              {tab === "forYou" && (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  For You
                </span>
              )}
              {tab === "saved" && "Saved"}
            </button>
          ))}
        </div>

        {/* For You - Top Matches Bento */}
        {filters.tab === "forYou" && hasProfile && topMatches.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-[#1D1D1F]">
                Top Picks for You
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Featured Large Card */}
              <Link
                href={`/brand/${topMatches[0].instagramUsername || topMatches[0].id}`}
                className="col-span-2 row-span-2 group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-auto">
                    {topMatches[0].profilePicture ? (
                      <Image
                        src={topMatches[0].profilePicture}
                        alt={topMatches[0].name}
                        width={80}
                        height={80}
                        unoptimized
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {topMatches[0].name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                      {topMatches[0].matchScore}% Match
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-1 group-hover:text-purple-600 transition-colors">
                      {topMatches[0].name}
                    </h3>
                    <p className="text-[#86868B] mb-4">@{topMatches[0].instagramUsername}</p>
                    <div className="flex items-center gap-4 text-sm text-[#86868B]">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(topMatches[0].followers || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {topMatches[0].partnershipCount || 0} collabs
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Smaller Bento Cards */}
              {topMatches.slice(1, 4).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.instagramUsername || brand.id}`}
                  className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {brand.profilePicture ? (
                      <Image
                        src={brand.profilePicture}
                        alt={brand.name}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {brand.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
                      {brand.matchScore}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#1D1D1F] mb-1 truncate group-hover:text-blue-600 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-[#86868B]">{formatNumber(brand.followers || 0)} followers</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Main Content */}
        {isLoading && brands.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
              </div>
              <p className="text-[#86868B]">Finding brands...</p>
            </div>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Search className="w-9 h-9 text-[#86868B]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">No brands found</h2>
              <p className="text-[#86868B] mb-6">Try adjusting your filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    tab: "all",
                    search: "",
                    category: "",
                    activityLevel: "",
                    creatorTier: "",
                    sponsorsNiche: "",
                    hasWebsite: false,
                    sort: "matchScore",
                    page: 1,
                  });
                }}
                className="px-6 py-3 bg-[#1D1D1F] text-white rounded-2xl font-medium hover:bg-[#1D1D1F]/90 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1D1D1F]">
                {filters.tab === "forYou" ? "All Matches" : filters.tab === "saved" ? "Saved Brands" : "All Brands"}
              </h2>
              <span className="text-sm text-[#86868B]">
                {brands.length} of {formatNumber(pagination.total)}
              </span>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {brands.map((brand, index) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.instagramUsername || brand.id}`}
                  className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {brand.profilePicture ? (
                        <Image
                          src={brand.profilePicture}
                          alt={brand.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-12 h-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {brand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-[#1D1D1F] group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                          {brand.name}
                          {brand.isVerifiedAccount && (
                            <BadgeCheck className="w-4 h-4 text-[#0071E3]" />
                          )}
                        </h3>
                        <p className="text-sm text-[#86868B]">@{brand.instagramUsername}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#86868B] hover:text-pink-500 hover:bg-pink-50 transition-all"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {brand.category && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F]">
                        {brand.category}
                      </span>
                    )}
                    {brand.partnershipCount && brand.partnershipCount > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-green-100 text-xs font-medium text-green-700">
                        {brand.partnershipCount} collabs
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#F5F5F7]">
                    <div className="flex items-center gap-4 text-sm text-[#86868B]">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(brand.followers || 0)}
                      </span>
                    </div>
                    {brand.matchScore && brand.matchScore > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              brand.matchScore >= 85 ? "bg-green-500" : brand.matchScore >= 70 ? "bg-purple-500" : "bg-orange-500"
                            }`}
                            style={{ width: `${brand.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[#1D1D1F]">{brand.matchScore}%</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1D1D1F] rounded-2xl font-medium hover:bg-[#F5F5F7] transition-all shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <span className="text-[#86868B]">({pagination.total - brands.length} left)</span>
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
