"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  LayoutGrid,
  List,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  ArrowDownAZ,
  Users,
  Globe,
  Flame,
  Search,
  Check,
} from "lucide-react";
import { TabType, SortType, ViewMode, CreatorTier, CategoryCount } from "@/hooks/use-brands";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DiscoveryFiltersProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: CategoryCount[];
  activityLevel: string;
  onActivityLevelChange: (level: string) => void;
  creatorTier: CreatorTier;
  onCreatorTierChange: (tier: CreatorTier) => void;
  sponsorsNiche: string;
  onSponsorsNicheChange: (niche: string) => void;
  creatorNiches: string[];
  hasWebsite: boolean;
  onHasWebsiteChange: (value: boolean) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  matchCount?: number;
  savedCount?: number;
  hasProfile: boolean;
  userNiche?: string | null;
  userFollowers?: number | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  tech: "💻",
  gaming: "🎮",
  beauty: "💄",
  fashion: "👗",
  food: "🍕",
  retail: "🛍️",
  media: "📺",
  entertainment: "🎬",
  home: "🏠",
  fitness: "💪",
  health: "🏥",
  hospitality: "🏨",
  other: "📦",
};

const NICHE_ICONS: Record<string, string> = {
  tech: "💻",
  lifestyle: "✨",
  art: "🎨",
  food: "🍕",
  beauty: "💄",
  travel: "✈️",
  pets: "🐾",
  sports: "⚽",
  fitness: "💪",
  fashion: "👗",
};

const CREATOR_TIER_OPTIONS: { label: string; value: CreatorTier; description: string }[] = [
  { label: "Any size", value: "", description: "All creator tiers" },
  { label: "Nano", value: "nano", description: "<10K followers" },
  { label: "Micro", value: "micro", description: "10K-50K" },
  { label: "Mid-tier", value: "mid", description: "50K-100K" },
  { label: "Macro", value: "macro", description: "100K-500K" },
  { label: "Mega", value: "mega", description: "500K+" },
];

const ACTIVITY_OPTIONS: { label: string; value: string; icon: React.ReactNode }[] = [
  { label: "Any", value: "", icon: null },
  { label: "Active", value: "active", icon: <Zap className="w-3.5 h-3.5" /> },
  { label: "Very Active", value: "veryActive", icon: <Flame className="w-3.5 h-3.5" /> },
  { label: "Rising", value: "rising", icon: <TrendingUp className="w-3.5 h-3.5" /> },
];

const SORT_OPTIONS: { label: string; value: SortType; icon: React.ReactNode }[] = [
  { label: "Most Active", value: "partnershipCount", icon: <Flame className="w-4 h-4" /> },
  { label: "Rising", value: "rising", icon: <TrendingUp className="w-4 h-4" /> },
  { label: "A to Z", value: "name", icon: <ArrowDownAZ className="w-4 h-4" /> },
];

function getCreatorTierFromFollowers(followers: number | null | undefined): CreatorTier {
  if (!followers) return "";
  if (followers < 10000) return "nano";
  if (followers < 50000) return "micro";
  if (followers < 100000) return "mid";
  if (followers < 500000) return "macro";
  return "mega";
}

export function DiscoveryFilters({
  tab,
  onTabChange,
  category,
  onCategoryChange,
  categoryCounts,
  activityLevel,
  onActivityLevelChange,
  creatorTier,
  onCreatorTierChange,
  sponsorsNiche,
  onSponsorsNicheChange,
  creatorNiches,
  hasWebsite,
  onHasWebsiteChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  matchCount,
  savedCount = 0,
  hasProfile,
  userNiche,
  userFollowers,
}: DiscoveryFiltersProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [nicheOpen, setNicheOpen] = useState(false);
  const [nicheSearch, setNicheSearch] = useState("");

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categoryCounts;
    const search = categorySearch.toLowerCase();
    return categoryCounts.filter(c => c.name.toLowerCase().includes(search));
  }, [categoryCounts, categorySearch]);

  // Filter niches by search
  const filteredNiches = useMemo(() => {
    if (!nicheSearch) return creatorNiches;
    const search = nicheSearch.toLowerCase();
    return creatorNiches.filter(n => n.toLowerCase().includes(search));
  }, [creatorNiches, nicheSearch]);

  // Count active filters
  const activeFilterCount = [
    category,
    activityLevel,
    creatorTier,
    sponsorsNiche,
    hasWebsite,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onCategoryChange("");
    onActivityLevelChange("");
    onCreatorTierChange("");
    onSponsorsNicheChange("");
    onHasWebsiteChange(false);
  };

  // Get user's tier for smart filter
  const userTier = getCreatorTierFromFollowers(userFollowers);
  const userTierLabel = CREATOR_TIER_OPTIONS.find(t => t.value === userTier)?.label || "";

  return (
    <div className="mb-6 space-y-4">
      {/* Row 1: Tabs + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
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

        {/* View Toggle */}
        <div className="flex items-center gap-2">
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

      {/* Row 2: Smart Filters (profile-dependent) + Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Smart Filter: Matches my tier */}
        {hasProfile && userFollowers && userTier && (
          <button
            onClick={() => onCreatorTierChange(creatorTier === userTier ? "" : userTier)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all ${
              creatorTier === userTier
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Works with {userTierLabel}</span>
            {creatorTier === userTier && (
              <X className="w-3.5 h-3.5 ml-1 opacity-70" />
            )}
          </button>
        )}

        {/* Divider if smart filters exist */}
        {hasProfile && userFollowers && (
          <div className="w-px h-6 bg-[var(--border)] mx-1 hidden sm:block" />
        )}

        {/* Category Dropdown with Search */}
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <button
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all ${
                category
                  ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
              }`}
            >
              {category ? (
                <>
                  <span>{CATEGORY_ICONS[category.toLowerCase()] || "📦"}</span>
                  <span className="capitalize">{category}</span>
                </>
              ) : (
                <span>Category</span>
              )}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[280px] p-0">
            {/* Search input */}
            <div className="p-2 border-b border-[var(--border)]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            {/* Category list */}
            <div className="max-h-[280px] overflow-y-auto p-2">
              {/* All option */}
              <button
                onClick={() => {
                  onCategoryChange("");
                  setCategoryOpen(false);
                  setCategorySearch("");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all ${
                  !category
                    ? "bg-[var(--accent)] text-white"
                    : "hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">✨</span>
                  <span className="font-medium">All Categories</span>
                </div>
                {!category && <Check className="w-4 h-4" />}
              </button>

              {filteredCategories.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-[var(--muted)]">
                  No categories found
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      onCategoryChange(cat.name === category ? "" : cat.name);
                      setCategoryOpen(false);
                      setCategorySearch("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all ${
                      category === cat.name
                        ? "bg-[var(--accent)] text-white"
                        : "hover:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{CATEGORY_ICONS[cat.name.toLowerCase()] || "📦"}</span>
                      <span className="font-medium capitalize">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${category === cat.name ? "text-white/70" : "text-[var(--muted)]"}`}>
                        {cat.count}
                      </span>
                      {category === cat.name && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Activity Level Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all ${
                activityLevel
                  ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
              }`}
            >
              {activityLevel ? (
                <>
                  {ACTIVITY_OPTIONS.find(o => o.value === activityLevel)?.icon}
                  <span>{ACTIVITY_OPTIONS.find(o => o.value === activityLevel)?.label}</span>
                </>
              ) : (
                <span>Activity</span>
              )}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px] p-2">
            {ACTIVITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onActivityLevelChange(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                  activityLevel === option.value
                    ? "bg-[var(--accent)] text-white"
                    : "hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {activityLevel === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sponsors Niche Dropdown with Search */}
        {creatorNiches.length > 0 && (
          <Popover open={nicheOpen} onOpenChange={setNicheOpen}>
            <PopoverTrigger asChild>
              <button
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all ${
                  sponsorsNiche
                    ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="capitalize">{sponsorsNiche || "Sponsors Niche"}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[240px] p-0">
              {/* Search input */}
              <div className="p-2 border-b border-[var(--border)]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <Input
                    placeholder="Search niches..."
                    value={nicheSearch}
                    onChange={(e) => setNicheSearch(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
              {/* Niche list */}
              <div className="max-h-[280px] overflow-y-auto p-2">
                {/* All option */}
                <button
                  onClick={() => {
                    onSponsorsNicheChange("");
                    setNicheOpen(false);
                    setNicheSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all ${
                    !sponsorsNiche
                      ? "bg-[var(--accent)] text-white"
                      : "hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">✨</span>
                    <span className="font-medium">All Niches</span>
                  </div>
                  {!sponsorsNiche && <Check className="w-4 h-4" />}
                </button>

                {filteredNiches.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-[var(--muted)]">
                    No niches found
                  </div>
                ) : (
                  filteredNiches.map((niche) => (
                    <button
                      key={niche}
                      onClick={() => {
                        onSponsorsNicheChange(niche === sponsorsNiche ? "" : niche);
                        setNicheOpen(false);
                        setNicheSearch("");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all ${
                        sponsorsNiche === niche
                          ? "bg-[var(--accent)] text-white"
                          : "hover:bg-[var(--surface-elevated)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{NICHE_ICONS[niche.toLowerCase()] || "🎯"}</span>
                        <span className="font-medium capitalize">{niche}</span>
                      </div>
                      {sponsorsNiche === niche && <Check className="w-4 h-4" />}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Has Website Toggle */}
        <button
          onClick={() => onHasWebsiteChange(!hasWebsite)}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all ${
            hasWebsite
              ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
              : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Has Website</span>
          {hasWebsite && <X className="w-3.5 h-3.5 ml-1 opacity-70" />}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] transition-all">
              {SORT_OPTIONS.find(o => o.value === sort)?.icon}
              <span>{SORT_OPTIONS.find(o => o.value === sort)?.label || "Sort"}</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] p-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                  sort === option.value
                    ? "bg-[var(--accent)] text-white"
                    : "hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                {sort === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap animate-fade-in">
          <span className="text-xs font-medium text-[var(--muted)]">Active:</span>
          {category && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <span>{CATEGORY_ICONS[category.toLowerCase()] || "📦"}</span>
              <span className="capitalize">{category}</span>
              <button
                onClick={() => onCategoryChange("")}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activityLevel && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              {ACTIVITY_OPTIONS.find(o => o.value === activityLevel)?.icon}
              <span>{ACTIVITY_OPTIONS.find(o => o.value === activityLevel)?.label}</span>
              <button
                onClick={() => onActivityLevelChange("")}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {creatorTier && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <Users className="w-3 h-3" />
              <span>{CREATOR_TIER_OPTIONS.find(t => t.value === creatorTier)?.label}</span>
              <button
                onClick={() => onCreatorTierChange("")}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {sponsorsNiche && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <Sparkles className="w-3 h-3" />
              <span className="capitalize">{sponsorsNiche}</span>
              <button
                onClick={() => onSponsorsNicheChange("")}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--accent)]/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {hasWebsite && (
            <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
              <Globe className="w-3 h-3" />
              <span>Has Website</span>
              <button
                onClick={() => onHasWebsiteChange(false)}
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
