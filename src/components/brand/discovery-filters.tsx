"use client";

import { ChevronDown, LayoutGrid, List } from "lucide-react";
import { TabType, SortType, ViewMode } from "@/hooks/use-brands";

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
}

const FOLLOWER_RANGES = [
  { label: "All sizes", value: "" },
  { label: "Nano (<10K)", value: "0-10000" },
  { label: "Micro (10K-100K)", value: "10000-100000" },
  { label: "Mid-tier (100K-1M)", value: "100000-1000000" },
  { label: "Macro (1M+)", value: "1000000-" },
];

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: "Best Match", value: "matchScore" },
  { label: "Most Active", value: "partnershipCount" },
  { label: "Most Followers", value: "followers" },
  { label: "Name A-Z", value: "name" },
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
}: DiscoveryFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-[var(--border)]">
      {/* Tabs */}
      <div className="tab-nav w-full lg:w-auto">
        <button
          className={`tab-nav-item ${tab === "all" ? "active" : ""}`}
          onClick={() => onTabChange("all")}
        >
          All
        </button>
        {hasProfile && (
          <button
            className={`tab-nav-item ${tab === "forYou" ? "active" : ""}`}
            onClick={() => onTabChange("forYou")}
          >
            For You
            {matchCount !== undefined && matchCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-[var(--accent-light)] text-[var(--accent)] rounded-full">
                {matchCount}
              </span>
            )}
          </button>
        )}
        <button
          className={`tab-nav-item ${tab === "saved" ? "active" : ""}`}
          onClick={() => onTabChange("saved")}
        >
          Saved
          {savedCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-[var(--accent-light)] text-[var(--accent)] rounded-full">
              {savedCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none h-10 pl-4 pr-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] cursor-pointer hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        </div>

        {/* Follower Range */}
        <div className="relative">
          <select
            value={followerRange}
            onChange={(e) => onFollowerRangeChange(e.target.value)}
            className="appearance-none h-10 pl-4 pr-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] cursor-pointer hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] transition-all"
          >
            {FOLLOWER_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            className="appearance-none h-10 pl-4 pr-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] cursor-pointer hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] transition-all"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        </div>

        {/* View Toggle */}
        <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-[var(--accent-light)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-[var(--accent-light)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
