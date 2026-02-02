"use client";

import { useState, useEffect, useCallback } from "react";
import { BrandData } from "@/components/brand-card";

export type TabType = "all" | "forYou" | "saved";
export type SortType = "matchScore" | "partnershipCount" | "followers" | "name";
export type ViewMode = "grid" | "list";

export interface BrandFilters {
  tab: TabType;
  search: string;
  category: string;
  niche: string;
  minFollowers: string;
  maxFollowers: string;
  activityLevel: string;
  sort: SortType;
  page: number;
  verified?: boolean;
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
  categories: string[];
  niches: string[];
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
  const [categories, setCategories] = useState<string[]>([]);
  const [niches, setNiches] = useState<string[]>([]);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  const fetchBrands = useCallback(
    async (append = false) => {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const currentPage = append ? filters.page : 1;

        if (filters.tab === "forYou" && userId) {
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

          if (filters.category) {
            filteredBrands = filteredBrands.filter(
              (b) => b.category === filters.category
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

          const uniqueCategories = [
            ...new Set(json.data.map((b: BrandData) => b.category).filter(Boolean)),
          ] as string[];
          setCategories(uniqueCategories);
        } else {
          const params = new URLSearchParams();
          params.set("page", String(currentPage));
          params.set("limit", "20");

          if (filters.search) params.set("search", filters.search);
          if (filters.category) params.set("category", filters.category);
          if (filters.niche) params.set("niche", filters.niche);
          if (filters.minFollowers) params.set("minFollowers", filters.minFollowers);
          if (filters.maxFollowers) params.set("maxFollowers", filters.maxFollowers);
          if (filters.activityLevel) params.set("activityLevel", filters.activityLevel);
          if (filters.verified) params.set("verified", "true");

          const sortMap: Record<SortType, string> = {
            matchScore: "partnershipCount",
            partnershipCount: "partnershipCount",
            followers: "followers",
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
          setCategories(json.filters?.categories || []);
          setNiches(json.filters?.niches || []);
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
    filters.category,
    filters.niche,
    filters.minFollowers,
    filters.maxFollowers,
    filters.activityLevel,
    filters.sort,
    filters.verified,
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
    categories,
    niches,
    hasMore: pagination.page < pagination.totalPages,
    loadMore,
    refetch,
  };
}
