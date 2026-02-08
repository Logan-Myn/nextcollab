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
  X,
  BadgeCheck,
  Zap,
  ArrowRight,
  LayoutGrid,
  List,
  Star,
  Filter,
  ChevronDown,
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
  { name: "Fashion", color: "#FF6B6B" },
  { name: "Beauty", color: "#FFD93D" },
  { name: "Fitness", color: "#6BCB77" },
  { name: "Food", color: "#FF8B94" },
  { name: "Tech", color: "#4ECDC4" },
  { name: "Travel", color: "#45B7D1" },
  { name: "Lifestyle", color: "#DDA0DD" },
  { name: "Gaming", color: "#A8E6CF" },
];

const CREATOR_TIERS = [
  { label: "ALL", value: "" },
  { label: "NANO", value: "nano", desc: "<10K" },
  { label: "MICRO", value: "micro", desc: "10K-50K" },
  { label: "MID", value: "mid", desc: "50K-100K" },
  { label: "MACRO", value: "macro", desc: "100K-500K" },
  { label: "MEGA", value: "mega", desc: "500K+" },
];

export default function NeubrutalismDesign() {
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
  const topMatches = brands.filter((b) => (b.matchScore || 0) >= 70).slice(0, 4);
  const activeFilterCount = [filters.creatorTier, filters.niche, filters.hasWebsite].filter(Boolean).length;

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {/* Neubrutalism Design - Bold, Playful, Gen-Z Aesthetic */}
      <div className="min-h-screen bg-[#FFFBEB]">
        {/* Header - Bold & Fun */}
        <header className="mb-10">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD93D] border-3 border-black rounded-full font-bold text-sm uppercase tracking-wider shadow-[4px_4px_0_0_#000]">
              <Sparkles className="w-4 h-4" />
              {formatNumber(pagination.total)} Brands
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-black leading-none">
            FIND YOUR
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">PERFECT</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#4ECDC4] -z-10 -rotate-1" />
            </span>
            {" "}
            <span className="relative inline-block">
              <span className="relative z-10">MATCH</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FF6B6B] -z-10 rotate-1" />
            </span>
          </h1>
        </header>

        {/* Search Bar - Chunky & Bold */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="TYPE TO SEARCH..."
              className="w-full h-16 pl-14 pr-6 bg-white border-3 border-black rounded-2xl text-lg font-bold placeholder:text-black/30 placeholder:font-bold focus:outline-none focus:ring-0 shadow-[6px_6px_0_0_#000] focus:shadow-[2px_2px_0_0_#000] focus:translate-x-1 focus:translate-y-1 transition-all uppercase"
            />
            {isLoading && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Loader2 className="w-6 h-6 text-black animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Tabs & Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Tabs - Chunky Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all", label: "ALL BRANDS", bg: "#FFFFFF" },
              { id: "forYou", label: "FOR YOU", bg: "#FFD93D", icon: <Sparkles className="w-4 h-4" /> },
              { id: "saved", label: "SAVED", bg: "#FF6B6B", icon: <Heart className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilters(f => ({ ...f, tab: tab.id as TabType }))}
                className={`px-5 py-3 border-3 border-black rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                  filters.tab === tab.id
                    ? "shadow-[4px_4px_0_0_#000] translate-x-0 translate-y-0"
                    : "shadow-none translate-x-1 translate-y-1 opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: filters.tab === tab.id ? tab.bg : "#FFFFFF" }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 lg:ml-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 px-5 border-3 border-black rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                showFilters ? "bg-black text-white shadow-none translate-x-1 translate-y-1" : "bg-white shadow-[4px_4px_0_0_#000]"
              }`}
            >
              <Filter className="w-4 h-4" />
              FILTERS
              {activeFilterCount > 0 && (
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  showFilters ? "bg-white text-black" : "bg-[#FF6B6B] text-white"
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000]">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-12 h-12 flex items-center justify-center transition-colors ${
                  viewMode === "grid" ? "bg-[#4ECDC4]" : "bg-white hover:bg-gray-100"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <div className="w-[3px] bg-black" />
              <button
                onClick={() => setViewMode("list")}
                className={`w-12 h-12 flex items-center justify-center transition-colors ${
                  viewMode === "list" ? "bg-[#4ECDC4]" : "bg-white hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel - Expanded */}
        {showFilters && (
          <div className="mb-8 p-6 bg-white border-3 border-black rounded-3xl shadow-[8px_8px_0_0_#000]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg uppercase tracking-wider">Filter Options</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFilters(f => ({ ...f, creatorTier: "", niche: "", hasWebsite: false }));
                  }}
                  className="text-sm font-bold text-[#FF6B6B] uppercase hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Creator Tier */}
              <div>
                <label className="block font-black text-sm uppercase tracking-wider mb-3">Works With</label>
                <div className="flex flex-wrap gap-2">
                  {CREATOR_TIERS.map((tier) => {
                    const isActive = filters.creatorTier === tier.value;
                    return (
                      <button
                        key={tier.value}
                        onClick={() => setFilters(f => ({ ...f, creatorTier: tier.value as CreatorTier }))}
                        className={`px-4 py-2 border-3 border-black rounded-xl font-bold text-sm transition-all ${
                          isActive
                            ? "bg-[#4ECDC4] shadow-[3px_3px_0_0_#000]"
                            : "bg-white shadow-none translate-x-0.5 translate-y-0.5"
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block font-black text-sm uppercase tracking-wider mb-3">Extras</label>
                <button
                  onClick={() => setFilters(f => ({ ...f, hasWebsite: !f.hasWebsite }))}
                  className={`w-full flex items-center justify-between px-4 py-3 border-3 border-black rounded-xl font-bold text-sm uppercase transition-all ${
                    filters.hasWebsite
                      ? "bg-[#FFD93D] shadow-[3px_3px_0_0_#000]"
                      : "bg-white shadow-none translate-x-0.5 translate-y-0.5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Has Website
                  </span>
                  <div className={`w-6 h-6 border-3 border-black rounded-md ${filters.hasWebsite ? "bg-black" : "bg-white"}`}>
                    {filters.hasWebsite && (
                      <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Matches Section - For You Tab */}
        {filters.tab === "forYou" && hasProfile && topMatches.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#FFD93D] border-3 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-2xl uppercase tracking-tight">TOP PICKS</h2>
                <p className="text-sm font-bold text-black/50 uppercase">Best matches for you</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topMatches.map((brand, index) => {
                const colors = ["#FF6B6B", "#FFD93D", "#4ECDC4", "#DDA0DD"];
                return (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.instagramUsername || brand.id}`}
                    className="group block cursor-pointer"
                  >
                    <div
                      className="p-5 border-3 border-black rounded-2xl transition-all duration-200 hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        {brand.profilePicture ? (
                          <Image
                            src={brand.profilePicture}
                            alt={brand.name}
                            width={60}
                            height={60}
                            unoptimized
                            className="w-15 h-15 rounded-xl object-cover border-3 border-black"
                          />
                        ) : (
                          <div className="w-15 h-15 rounded-xl bg-white border-3 border-black flex items-center justify-center">
                            <span className="text-2xl font-black">{brand.name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="px-3 py-1.5 bg-white border-3 border-black rounded-full font-black text-sm shadow-[3px_3px_0_0_#000]">
                          {brand.matchScore}%
                        </span>
                      </div>

                      <h3 className="font-black text-lg truncate mb-1 group-hover:underline decoration-3">
                        {brand.name}
                      </h3>
                      <p className="text-sm font-bold opacity-70 truncate">@{brand.instagramUsername}</p>

                      <div className="mt-4 pt-4 border-t-3 border-black/20 flex items-center gap-3 text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {formatNumber(brand.followers || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {brand.partnershipCount || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Main Content */}
        {isLoading && brands.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-[#4ECDC4] border-3 border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0_0_#000] animate-bounce">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
              <p className="font-black uppercase tracking-wider">LOADING...</p>
            </div>
          </div>
        ) : brands.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-white border-3 border-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0_0_#000]">
                <Search className="w-12 h-12" />
              </div>
              <h2 className="font-black text-3xl uppercase tracking-tight mb-3">NO RESULTS!</h2>
              <p className="font-bold text-black/50 mb-8">Try different filters</p>
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
                className="px-8 py-4 bg-[#FF6B6B] border-3 border-black rounded-xl font-black uppercase tracking-wider shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                RESET ALL
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-2xl uppercase tracking-tight">
                {filters.tab === "forYou" ? "ALL MATCHES" : filters.tab === "saved" ? "SAVED" : "ALL BRANDS"}
              </h2>
              <span className="px-4 py-2 bg-black text-white rounded-full font-bold text-sm">
                {brands.length} / {formatNumber(pagination.total)}
              </span>
            </div>

            {/* Grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {brands.map((brand, index) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.instagramUsername || brand.id}`}
                    className="group block cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0_0_#000] transition-all duration-200 hover:shadow-[10px_10px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {brand.profilePicture ? (
                            <Image
                              src={brand.profilePicture}
                              alt={brand.name}
                              width={52}
                              height={52}
                              unoptimized
                              className="w-13 h-13 rounded-xl object-cover border-3 border-black"
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-xl bg-[#FFD93D] border-3 border-black flex items-center justify-center">
                              <span className="font-black text-xl">{brand.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-black text-lg truncate group-hover:underline decoration-3 flex items-center gap-1.5">
                              {brand.name}
                              {brand.isVerifiedAccount && (
                                <BadgeCheck className="w-5 h-5 text-[#4ECDC4]" />
                              )}
                            </h3>
                            <p className="text-sm font-bold text-black/50">@{brand.instagramUsername}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="w-10 h-10 border-3 border-black rounded-xl flex items-center justify-center hover:bg-[#FF6B6B] transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {brand.category && (
                          <span className="px-3 py-1 bg-[#F5F5F5] border-2 border-black rounded-lg text-xs font-bold uppercase">
                            {brand.category}
                          </span>
                        )}
                        {(brand.partnershipCount || 0) > 0 && (
                          <span className="px-3 py-1 bg-[#4ECDC4] border-2 border-black rounded-lg text-xs font-bold uppercase">
                            {brand.partnershipCount} COLLABS
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t-3 border-black/10">
                        <div className="flex items-center gap-4 text-sm font-bold text-black/50">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {formatNumber(brand.followers || 0)}
                          </span>
                        </div>
                        {brand.matchScore && brand.matchScore > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-3 bg-black/10 rounded-full overflow-hidden border-2 border-black">
                              <div
                                className={`h-full ${
                                  brand.matchScore >= 85 ? "bg-[#4ECDC4]" : brand.matchScore >= 70 ? "bg-[#FFD93D]" : "bg-[#FF6B6B]"
                                }`}
                                style={{ width: `${brand.matchScore}%` }}
                              />
                            </div>
                            <span className="font-black text-sm">{brand.matchScore}%</span>
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
                    className="group flex items-center gap-4 p-4 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0_0_#000] transition-all hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {brand.profilePicture ? (
                      <Image
                        src={brand.profilePicture}
                        alt={brand.name}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-12 h-12 rounded-lg object-cover border-3 border-black"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#FFD93D] border-3 border-black flex items-center justify-center">
                        <span className="font-black">{brand.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black truncate group-hover:underline decoration-2">
                        {brand.name}
                      </h4>
                      <p className="text-sm font-bold text-black/50 truncate">
                        {brand.category || brand.niche} · {formatNumber(brand.followers || 0)}
                      </p>
                    </div>
                    {brand.matchScore && brand.matchScore > 0 && (
                      <span className={`px-4 py-2 border-3 border-black rounded-lg font-black text-sm ${
                        brand.matchScore >= 85 ? "bg-[#4ECDC4]" : brand.matchScore >= 70 ? "bg-[#FFD93D]" : "bg-[#FF6B6B]"
                      }`}>
                        {brand.matchScore}%
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="w-10 h-10 border-3 border-black rounded-lg flex items-center justify-center hover:bg-[#FF6B6B] transition-colors"
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
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[#FFD93D] border-3 border-black rounded-xl font-black uppercase tracking-wider shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      LOADING...
                    </>
                  ) : (
                    <>
                      LOAD MORE
                      <span className="px-3 py-1 bg-black text-white rounded-full text-xs">
                        {pagination.total - brands.length} LEFT
                      </span>
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
