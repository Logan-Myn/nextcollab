"use client";

import { useState, useEffect, useCallback } from "react";
import { BrandData } from "@/components/brand-card";

export type TabType = "all" | "forYou" | "saved";
export type SortType = "matchScore" | "partnershipCount" | "rising" | "name";
export type ViewMode = "grid" | "list";
export type CreatorTier = "" | "nano" | "micro" | "mid" | "macro" | "mega";

export interface BrandFilters {
  tab: TabType;
  search: string;
  activityLevel: string; // "veryActive" | "active" | "rising" | ""
  creatorTier: CreatorTier; // matches avg_creator_followers
  niche: string; // matches typical_creator_niches
  hasWebsite: boolean;
  sort: SortType;
  page: number;
}

export interface UseBrandsResult {
  brands: BrandData[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  creatorNiches: string[];
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

interface MatchStats {
  total: number;
  excellent: number;
  good: number;
  creatorNiche: string | null;
  creatorFollowers: number | null;
}

export function useBrands(
  filters: BrandFilters,
  userId: string | undefined
): UseBrandsResult {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [creatorNiches, setCreatorNiches] = useState<string[]>([]);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  const fetchBrands = useCallback(
    async (append = false) => {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const currentPage = append ? filters.page : 1;

        if (filters.tab === "saved" && userId) {
          // Fetch saved brands from favorites API
          const res = await fetch(
            `/api/favorites?userId=${encodeURIComponent(userId)}&page=${currentPage}&limit=20`
          );
          if (!res.ok) throw new Error("Failed to fetch saved brands");
          const json = await res.json();

          // Extract brands from favorite records
          const savedBrands = json.data.map((f: { brand: BrandData }) => f.brand);

          if (append) {
            setBrands((prev) => [...prev, ...savedBrands]);
          } else {
            setBrands(savedBrands);
          }

          setPagination(json.pagination);
          setCreatorNiches([]);
        } else if (filters.tab === "forYou" && userId) {
          const res = await fetch(
            `/api/brands/matches?userId=${encodeURIComponent(userId)}`
          );
          if (!res.ok) throw new Error("Failed to fetch matches");
          const json = await res.json();

          let filteredBrands = json.data as BrandData[];

          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredBrands = filteredBrands.filter(
              (b) =>
                b.name.toLowerCase().includes(searchLower) ||
                b.instagramUsername?.toLowerCase().includes(searchLower)
            );
          }

          setBrands(filteredBrands);
          setMatchStats(json.stats);
          setPagination({
            page: 1,
            limit: filteredBrands.length,
            total: filteredBrands.length,
            totalPages: 1,
          });
        } else {
          const params = new URLSearchParams();
          params.set("page", String(currentPage));
          params.set("limit", "20");

          if (filters.search) params.set("search", filters.search);
          if (filters.activityLevel) params.set("activityLevel", filters.activityLevel);
          if (filters.creatorTier) params.set("creatorTier", filters.creatorTier);
          if (filters.niche) params.set("sponsorsNiche", filters.niche);
          if (filters.hasWebsite) params.set("hasWebsite", "true");

          const sortMap: Record<SortType, string> = {
            matchScore: "partnershipCount",
            partnershipCount: "partnershipCount",
            rising: "partnershipCount",
            name: "name",
          };
          params.set("sortBy", sortMap[filters.sort] || "partnershipCount");
          params.set("sortOrder", filters.sort === "name" ? "asc" : "desc");

          const res = await fetch(`/api/brands?${params.toString()}`);
          if (!res.ok) throw new Error("Failed to fetch brands");
          const json = await res.json();

          if (append) {
            setBrands((prev) => [...prev, ...json.data]);
          } else {
            setBrands(json.data);
          }

          setPagination(json.pagination);
          setCreatorNiches(json.filters?.creatorNiches || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, userId]
  );

  useEffect(() => {
    fetchBrands(false);
  }, [
    filters.tab,
    filters.search,
    filters.activityLevel,
    filters.creatorTier,
    filters.niche,
    filters.hasWebsite,
    filters.sort,
    userId,
  ]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchBrands(true);
    }
  }, [pagination, fetchBrands]);

  const refetch = useCallback(() => {
    fetchBrands(false);
  }, [fetchBrands]);

  return {
    brands,
    isLoading,
    error,
    pagination,
    creatorNiches,
    hasMore: pagination.page < pagination.totalPages,
    loadMore,
    refetch,
  };
}
