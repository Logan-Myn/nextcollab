"use client";

import { useState } from "react";
import {
  ChevronUp,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Sparkles,
  Zap,
  Users,
  BadgeCheck,
  TrendingUp,
  ArrowDownAZ,
} from "lucide-react";
import { TabType, SortType, ViewMode } from "@/hooks/use-brands";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface DiscoveryFiltersProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  followerRange: string;
  onFollowerRangeChange: (range: string) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  matchCount?: number;
  savedCount?: number;
  hasProfile: boolean;
  verifiedOnly?: boolean;
  onVerifiedOnlyChange?: (value: boolean) => void;
  activeOnly?: boolean;
  onActiveOnlyChange?: (value: boolean) => void;
  myNicheOnly?: boolean;
  onMyNicheOnlyChange?: (value: boolean) => void;
  userNiche?: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  Fashion: "👗",
  Beauty: "💄",
  Fitness: "💪",
  Food: "🍕",
  Tech: "💻",
  Travel: "✈️",
  Lifestyle: "🌟",
  Gaming: "🎮",
  Music: "🎵",
  Sports: "⚽",
  Health: "🏥",
  Finance: "💰",
  Education: "📚",
  Entertainment: "🎬",
  Retail: "🛍️",
  Home: "🏠",
  Media: "📺",
  Other: "📦",
};

const FOLLOWER_RANGES = [
  { label: "All", value: "", description: "Any size" },
  { label: "Nano", value: "0-10000", description: "<10K" },
  { label: "Micro", value: "10000-100000", description: "10K-100K" },
  { label: "Mid", value: "100000-1000000", description: "100K-1M" },
  { label: "Macro", value: "1000000-", description: "1M+" },
];

const SORT_OPTIONS: { label: string; value: SortType; icon: React.ReactNode; description: string }[] = [
  { label: "Best Match", value: "matchScore", icon: <Sparkles className="w-4 h-4" />, description: "AI-powered relevance" },
  { label: "Most Active", value: "partnershipCount", icon: <TrendingUp className="w-4 h-4" />, description: "Recent partnerships" },
  { label: "Followers", value: "followers", icon: <Users className="w-4 h-4" />, description: "Audience size" },
  { label: "A to Z", value: "name", icon: <ArrowDownAZ className="w-4 h-4" />, description: "Alphabetical" },
];

export function DiscoveryFilters({
  tab,
  onTabChange,
  category,
  onCategoryChange,
  categories,
  followerRange,
  onFollowerRangeChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  matchCount,
  savedCount = 0,
  hasProfile,
  verifiedOnly = false,
  onVerifiedOnlyChange,
  activeOnly = false,
  onActiveOnlyChange,
  myNicheOnly = false,
  onMyNicheOnlyChange,
  userNiche,
}: DiscoveryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active filters
  const activeFilterCount = [
    category,
    followerRange,
    verifiedOnly,
    activeOnly,
    myNicheOnly,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onCategoryChange("");
    onFollowerRangeChange("");
    onVerifiedOnlyChange?.(false);
    onActiveOnlyChange?.(false);
    onMyNicheOnlyChange?.(false);
  };

  return (
    <div className="mb-6">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "all"
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            onClick={() => onTabChange("all")}
          >
            All
          </button>
          {hasProfile && (
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                tab === "forYou"
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => onTabChange("forYou")}
            >
              <Sparkles className="w-3.5 h-3.5" />
              For You
              {matchCount !== undefined && matchCount > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                  tab === "forYou"
                    ? "bg-[var(--background)]/20 text-[var(--background)]"
                    : "bg-[var(--accent-light)] text-[var(--accent)]"
                }`}>
                  {matchCount}
                </span>
              )}
            </button>
          )}
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "saved"
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            onClick={() => onTabChange("saved")}
          >
            Saved
            {savedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-[var(--accent-light)] text-[var(--accent)] rounded-md">
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Filter Button + View Toggle */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl border transition-all ${
              isExpanded || activeFilterCount > 0
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className={`flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                isExpanded ? "bg-white/20 text-white" : "bg-white text-[var(--accent)]"
              }`}>
                {activeFilterCount}
              </span>
            )}
            <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`} />
          </button>

          {/* View Toggle */}
          <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel - Inline Accordion */}
      <div
        className="grid transition-all duration-300 ease-out"
        style={{
          gridTemplateRows: isExpanded ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="pt-6">
            {/* Filter Panel Content */}
            <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Filter Brands</h3>
                    <p className="text-xs text-[var(--muted)]">
                      {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'Refine your search'}
                    </p>
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-medium text-[var(--muted)] hover:text-[var(--error)] transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Filter Grid - 4 Columns on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Column 1: Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                    Category
                  </label>
                  <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin">
                    <button
                      onClick={() => onCategoryChange("")}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all text-left ${
                        !category
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--border)]"
                      }`}
                    >
                      <span className="w-5 text-center">✨</span>
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => onCategoryChange(cat === category ? "" : cat)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all text-left ${
                          category === cat
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--border)]"
                        }`}
                      >
                        <span className="w-5 text-center">{CATEGORY_ICONS[cat] || "📦"}</span>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 2: Brand Size */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                    Brand Size
                  </label>
                  <div className="space-y-1.5">
                    {FOLLOWER_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => onFollowerRangeChange(range.value === followerRange ? "" : range.value)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                          followerRange === range.value
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--border)]"
                        }`}
                      >
                        <span className="text-sm font-medium">{range.label}</span>
                        <span className={`text-xs ${
                          followerRange === range.value ? "text-white/70" : "text-[var(--muted)]"
                        }`}>
                          {range.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 3: Smart Filters */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                    Smart Filters
                  </label>
                  <div className="space-y-2">
                    {/* Verified Only */}
                    <label
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        verifiedOnly
                          ? "bg-[var(--accent)]/10 border-[var(--accent)]"
                          : "bg-[var(--surface-elevated)] border-transparent hover:border-[var(--border)]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        verifiedOnly ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                      }`}>
                        <BadgeCheck className={`w-4 h-4 ${verifiedOnly ? "text-white" : "text-[var(--muted)]"}`} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">Verified only</div>
                        <div className="text-xs text-[var(--muted)] truncate">Official accounts</div>
                      </div>
                      <Switch
                        checked={verifiedOnly}
                        onCheckedChange={(checked) => onVerifiedOnlyChange?.(checked)}
                      />
                    </label>

                    {/* Active This Month */}
                    <label
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        activeOnly
                          ? "bg-[var(--accent)]/10 border-[var(--accent)]"
                          : "bg-[var(--surface-elevated)] border-transparent hover:border-[var(--border)]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        activeOnly ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                      }`}>
                        <Zap className={`w-4 h-4 ${activeOnly ? "text-white" : "text-[var(--muted)]"}`} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">Active recently</div>
                        <div className="text-xs text-[var(--muted)] truncate">Partnered this month</div>
                      </div>
                      <Switch
                        checked={activeOnly}
                        onCheckedChange={(checked) => onActiveOnlyChange?.(checked)}
                      />
                    </label>

                    {/* My Niche Only */}
                    {hasProfile && userNiche && (
                      <label
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          myNicheOnly
                            ? "bg-[var(--accent)]/10 border-[var(--accent)]"
                            : "bg-[var(--surface-elevated)] border-transparent hover:border-[var(--border)]"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          myNicheOnly ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                        }`}>
                          <Sparkles className={`w-4 h-4 ${myNicheOnly ? "text-white" : "text-[var(--muted)]"}`} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">My niche</div>
                          <div className="text-xs text-[var(--muted)] truncate capitalize">{userNiche} brands</div>
                        </div>
                        <Switch
                          checked={myNicheOnly}
                          onCheckedChange={(checked) => onMyNicheOnlyChange?.(checked)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Column 4: Sort By */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                    Sort By
                  </label>
                  <div className="space-y-1.5">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onSortChange(option.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          sort === option.value
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--border)]"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                          sort === option.value ? "bg-white/20" : "bg-[var(--border)]"
                        }`}>
                          {option.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className={`text-xs ${
                            sort === option.value ? "text-white/70" : "text-[var(--muted)]"
                          }`}>
                            {option.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Pills - Always visible when filters are active */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="flex items-center gap-2 mt-4 flex-wrap animate-fade-in">
          <span className="text-xs font-medium text-[var(--muted)]">Active:</span>
          {category && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <span>{CATEGORY_ICONS[category] || "📦"}</span>
              {category}
              <button
                onClick={() => onCategoryChange("")}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {followerRange && (
            <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              {FOLLOWER_RANGES.find(r => r.value === followerRange)?.label}
              <button
                onClick={() => onFollowerRangeChange("")}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <BadgeCheck className="w-3 h-3" />
              Verified
              <button
                onClick={() => onVerifiedOnlyChange?.(false)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeOnly && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <Zap className="w-3 h-3" />
              Active
              <button
                onClick={() => onActiveOnlyChange?.(false)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {myNicheOnly && userNiche && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <Sparkles className="w-3 h-3" />
              {userNiche}
              <button
                onClick={() => onMyNicheOnlyChange?.(false)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--error)] transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
