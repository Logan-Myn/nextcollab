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
  SlidersHorizontal,
} from "lucide-react";
import { TabType, SortType, ViewMode, CreatorTier } from "@/hooks/use-brands";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DiscoveryFiltersProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
  activityLevel: string;
  onActivityLevelChange: (level: string) => void;
  creatorTier: CreatorTier;
  onCreatorTierChange: (tier: CreatorTier) => void;
  niche: string;
  onNicheChange: (niche: string) => void;
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
  gaming: "🎮",
  entertainment: "🎬",
  health: "🏥",
  home: "🏠",
  media: "📺",
  retail: "🛍️",
  hospitality: "🏨",
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
  activityLevel,
  onActivityLevelChange,
  creatorTier,
  onCreatorTierChange,
  niche,
  onNicheChange,
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
  const [nicheOpen, setNicheOpen] = useState(false);
  const [nicheSearch, setNicheSearch] = useState("");
  const [activityOpen, setActivityOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filteredNiches = useMemo(() => {
    if (!nicheSearch) return creatorNiches;
    const search = nicheSearch.toLowerCase();
    return creatorNiches.filter(n => n.toLowerCase().includes(search));
  }, [creatorNiches, nicheSearch]);

  const activeFilterCount = [
    activityLevel,
    creatorTier,
    niche,
    hasWebsite,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onActivityLevelChange("");
    onCreatorTierChange("");
    onNicheChange("");
    onHasWebsiteChange(false);
  };

  const userTier = getCreatorTierFromFollowers(userFollowers);
  const userTierLabel = CREATOR_TIER_OPTIONS.find(t => t.value === userTier)?.label || "";

  return (
    <div className="mb-6 space-y-3">
      {/* Row 1: Tabs + View Toggle */}
      <div className="flex items-center justify-between gap-4">
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

        {/* View Toggle + Sort */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Popover open={sortOpen} onOpenChange={setSortOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] transition-all">
                {SORT_OPTIONS.find(o => o.value === sort)?.icon}
                <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sort)?.label || "Sort"}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[180px] p-1.5">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setSortOpen(false);
                  }}
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
            </PopoverContent>
          </Popover>

          <div className="w-px h-6 bg-[var(--border)]" />

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

      {/* Row 2: Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter icon label */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </div>

        {/* Smart Filter: Matches my tier */}
        {hasProfile && userFollowers && userTier && (
          <button
            onClick={() => onCreatorTierChange(creatorTier === userTier ? "" : userTier)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-full border transition-all ${
              creatorTier === userTier
                ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/20"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-elevated)]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Works with {userTierLabel}</span>
            {creatorTier === userTier && (
              <X className="w-3 h-3 ml-0.5 opacity-70" />
            )}
          </button>
        )}

        {/* Niche Filter */}
        {creatorNiches.length > 0 && (
          <Popover open={nicheOpen} onOpenChange={(open) => {
            setNicheOpen(open);
            if (!open) setNicheSearch("");
          }}>
            <PopoverTrigger asChild>
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-full border transition-all ${
                  niche
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/20"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-elevated)]"
                }`}
              >
                {niche ? (
                  <span className="text-sm">{NICHE_ICONS[niche.toLowerCase()] || "🎯"}</span>
                ) : null}
                <span className="capitalize">{niche || "Niche"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${nicheOpen ? "rotate-180" : ""} ${niche ? "opacity-70" : "opacity-50"}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[260px] p-0">
              <div className="p-2 border-b border-[var(--border)]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <Input
                    placeholder="Search niches..."
                    value={nicheSearch}
                    onChange={(e) => setNicheSearch(e.target.value)}
                    className="pl-8 h-8 text-sm border-none bg-[var(--surface)] focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  />
                </div>
              </div>
              <div className="max-h-[280px] overflow-y-auto p-1.5">
                <button
                  onClick={() => {
                    onNicheChange("");
                    setNicheOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                    !niche
                      ? "bg-[var(--accent)] text-white"
                      : "hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <span className="font-medium">All Niches</span>
                  {!niche && <Check className="w-4 h-4" />}
                </button>

                {filteredNiches.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-[var(--muted)]">
                    No niches found
                  </div>
                ) : (
                  filteredNiches.map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        onNicheChange(n === niche ? "" : n);
                        setNicheOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                        niche === n
                          ? "bg-[var(--accent)] text-white"
                          : "hover:bg-[var(--surface-elevated)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{NICHE_ICONS[n.toLowerCase()] || "🎯"}</span>
                        <span className="font-medium capitalize">{n}</span>
                      </div>
                      {niche === n && <Check className="w-4 h-4" />}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Activity Level Filter */}
        <Popover open={activityOpen} onOpenChange={setActivityOpen}>
          <PopoverTrigger asChild>
            <button
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-full border transition-all ${
                activityLevel
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/20"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-elevated)]"
              }`}
            >
              {activityLevel ? (
                ACTIVITY_OPTIONS.find(o => o.value === activityLevel)?.icon
              ) : null}
              <span>{activityLevel ? ACTIVITY_OPTIONS.find(o => o.value === activityLevel)?.label : "Activity"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activityOpen ? "rotate-180" : ""} ${activityLevel ? "opacity-70" : "opacity-50"}`} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[200px] p-1.5">
            {ACTIVITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onActivityLevelChange(option.value);
                  setActivityOpen(false);
                }}
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
          </PopoverContent>
        </Popover>

        {/* Creator Tier Filter */}
        <Popover open={tierOpen} onOpenChange={setTierOpen}>
          <PopoverTrigger asChild>
            <button
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-full border transition-all ${
                creatorTier
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/20"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-elevated)]"
              }`}
            >
              {creatorTier ? <Users className="w-3.5 h-3.5" /> : null}
              <span>{creatorTier ? CREATOR_TIER_OPTIONS.find(t => t.value === creatorTier)?.label : "Creator Size"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${tierOpen ? "rotate-180" : ""} ${creatorTier ? "opacity-70" : "opacity-50"}`} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[220px] p-1.5">
            {CREATOR_TIER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onCreatorTierChange(option.value);
                  setTierOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                  creatorTier === option.value
                    ? "bg-[var(--accent)] text-white"
                    : "hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <div>
                  <span className="font-medium">{option.label}</span>
                  {option.description && option.value && (
                    <span className={`ml-2 text-xs ${
                      creatorTier === option.value ? "text-white/60" : "text-[var(--muted)]"
                    }`}>
                      {option.description}
                    </span>
                  )}
                </div>
                {creatorTier === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Has Website Toggle */}
        <button
          onClick={() => onHasWebsiteChange(!hasWebsite)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-full border transition-all ${
            hasWebsite
              ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/20"
              : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-elevated)]"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Has Website</span>
          {hasWebsite && <X className="w-3 h-3 ml-0.5 opacity-70" />}
        </button>

        {/* Clear all - only show when filters active */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
