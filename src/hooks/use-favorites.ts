"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BrandData } from "@/components/brand-card";

interface FavoriteRecord {
  id: string;
  brandId: string;
  createdAt: string;
  brand: BrandData;
}

interface UseFavoritesResult {
  savedBrandIds: Set<string>;
  savedBrands: BrandData[];
  isLoading: boolean;
  error: string | null;
  saveBrand: (brandId: string) => Promise<void>;
  unsaveBrand: (brandId: string) => Promise<void>;
  toggleSave: (brandId: string) => Promise<void>;
  isSaved: (brandId: string) => boolean;
  isSaving: (brandId: string) => boolean;
  count: number;
  refetch: () => void;
}

export function useFavorites(userId: string | undefined): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  // Track optimistically added brand IDs (before API confirms)
  const [pendingSaveIds, setPendingSaveIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const json = await res.json();
      setFavorites(json.data || []);
      // Clear pending saves since we have fresh data
      setPendingSaveIds(new Set());
    } catch (err) {
      console.error("[useFavorites] Fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Include both confirmed favorites and pending saves
  const savedBrandIds = useMemo(() => {
    const ids = new Set(favorites.map((f) => f.brandId));
    pendingSaveIds.forEach((id) => ids.add(id));
    return ids;
  }, [favorites, pendingSaveIds]);

  const savedBrands = useMemo(() => {
    return favorites.map((f) => f.brand);
  }, [favorites]);

  const isSaved = useCallback(
    (brandId: string) => savedBrandIds.has(brandId),
    [savedBrandIds]
  );

  const isSaving = useCallback(
    (brandId: string) => savingIds.has(brandId),
    [savingIds]
  );

  const saveBrand = useCallback(
    async (brandId: string) => {
      if (!userId) {
        console.error("[useFavorites] No userId, cannot save");
        return;
      }

      if (savedBrandIds.has(brandId)) {
        console.log("[useFavorites] Brand already saved:", brandId);
        return;
      }

      // Optimistic update - add to pending saves immediately
      setSavingIds((prev) => new Set(prev).add(brandId));
      setPendingSaveIds((prev) => new Set(prev).add(brandId));

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, brandId }),
        });

        const json = await res.json();

        if (!res.ok) {
          console.error("[useFavorites] Save API error:", json);
          // Rollback optimistic update
          setPendingSaveIds((prev) => {
            const next = new Set(prev);
            next.delete(brandId);
            return next;
          });
          throw new Error(json.error || "Failed to save brand");
        }

        console.log("[useFavorites] Save successful:", json);

        // Refetch to get the full brand data
        await fetchFavorites();
      } catch (err) {
        console.error("[useFavorites] Save error:", err);
        // Rollback optimistic update
        setPendingSaveIds((prev) => {
          const next = new Set(prev);
          next.delete(brandId);
          return next;
        });
        setError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(brandId);
          return next;
        });
      }
    },
    [userId, savedBrandIds, fetchFavorites]
  );

  const unsaveBrand = useCallback(
    async (brandId: string) => {
      if (!userId) {
        console.error("[useFavorites] No userId, cannot unsave");
        return;
      }

      if (!savedBrandIds.has(brandId)) {
        console.log("[useFavorites] Brand not saved:", brandId);
        return;
      }

      // Optimistic update
      setSavingIds((prev) => new Set(prev).add(brandId));
      const previousFavorites = favorites;
      const previousPendingSaves = pendingSaveIds;
      setFavorites((prev) => prev.filter((f) => f.brandId !== brandId));
      setPendingSaveIds((prev) => {
        const next = new Set(prev);
        next.delete(brandId);
        return next;
      });

      try {
        const res = await fetch(
          `/api/favorites?userId=${encodeURIComponent(userId)}&brandId=${encodeURIComponent(brandId)}`,
          { method: "DELETE" }
        );

        const json = await res.json();

        if (!res.ok) {
          console.error("[useFavorites] Unsave API error:", json);
          // Rollback on error
          setFavorites(previousFavorites);
          setPendingSaveIds(previousPendingSaves);
          throw new Error(json.error || "Failed to remove from saved");
        }

        console.log("[useFavorites] Unsave successful:", json);
      } catch (err) {
        console.error("[useFavorites] Unsave error:", err);
        // Rollback on error
        setFavorites(previousFavorites);
        setPendingSaveIds(previousPendingSaves);
        setError(err instanceof Error ? err.message : "Failed to unsave");
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(brandId);
          return next;
        });
      }
    },
    [userId, savedBrandIds, favorites, pendingSaveIds]
  );

  const toggleSave = useCallback(
    async (brandId: string) => {
      console.log("[useFavorites] toggleSave called:", brandId, "isSaved:", savedBrandIds.has(brandId));
      if (savedBrandIds.has(brandId)) {
        await unsaveBrand(brandId);
      } else {
        await saveBrand(brandId);
      }
    },
    [savedBrandIds, saveBrand, unsaveBrand]
  );

  return {
    savedBrandIds,
    savedBrands,
    isLoading,
    error,
    saveBrand,
    unsaveBrand,
    toggleSave,
    isSaved,
    isSaving,
    count: favorites.length,
    refetch: fetchFavorites,
  };
}
