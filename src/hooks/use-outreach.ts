"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BrandData } from "@/components/brand-card";

export type OutreachStatus =
  | "pitched"
  | "negotiating"
  | "confirmed"
  | "completed"
  | "rejected"
  | "ghosted";

export interface OutreachRecord {
  id: string;
  brandId: string;
  status: string;
  notes: string | null;
  pitchSubject: string | null;
  pitchBody: string | null;
  pitchTone: string | null;
  pitchedAt: string | null;
  confirmedAt: string | null;
  paidAt: string | null;
  amount: string | null;
  createdAt: string;
  updatedAt: string;
  brand: BrandData;
}

export type OutreachStats = Record<OutreachStatus, number>;

interface UseOutreachResult {
  records: OutreachRecord[];
  stats: OutreachStats;
  isLoading: boolean;
  error: string | null;
  statusFilter: OutreachStatus | "all";
  setStatusFilter: (status: OutreachStatus | "all") => void;
  updateStatus: (id: string, status: OutreachStatus) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  updateAmount: (id: string, amount: number) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  isUpdating: (id: string) => boolean;
  totalCount: number;
  refetch: () => void;
}

export function useOutreach(userId: string | undefined): UseOutreachResult {
  const [records, setRecords] = useState<OutreachRecord[]>([]);
  const [stats, setStats] = useState<OutreachStats>({
    pitched: 0,
    negotiating: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
    ghosted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "all">("all");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const fetchOutreach = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ userId, limit: "100" });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/outreach?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch outreach records");
      const json = await res.json();
      setRecords(json.data || []);
      setStats(json.stats || {
        pitched: 0,
        negotiating: 0,
        confirmed: 0,
        completed: 0,
        rejected: 0,
        ghosted: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [userId, statusFilter]);

  useEffect(() => {
    fetchOutreach();
  }, [fetchOutreach]);

  const isUpdating = useCallback(
    (id: string) => updatingIds.has(id),
    [updatingIds]
  );

  const updateStatus = useCallback(
    async (id: string, status: OutreachStatus) => {
      setUpdatingIds((prev) => new Set(prev).add(id));

      // Optimistic update
      const previousRecords = records;
      const previousStats = stats;

      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );

      // Update stats optimistically
      const oldRecord = records.find((r) => r.id === id);
      if (oldRecord) {
        setStats((prev) => ({
          ...prev,
          [oldRecord.status as OutreachStatus]: Math.max(0, prev[oldRecord.status as OutreachStatus] - 1),
          [status]: prev[status] + 1,
        }));
      }

      try {
        const res = await fetch(`/api/outreach/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!res.ok) {
          // Rollback
          setRecords(previousRecords);
          setStats(previousStats);
          const json = await res.json();
          throw new Error(json.error || "Failed to update status");
        }

        // Refetch to get updated timestamps
        await fetchOutreach();
      } catch (err) {
        setRecords(previousRecords);
        setStats(previousStats);
        setError(err instanceof Error ? err.message : "Failed to update");
        throw err;
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [records, stats, fetchOutreach]
  );

  const updateNotes = useCallback(
    async (id: string, notes: string) => {
      setUpdatingIds((prev) => new Set(prev).add(id));

      const previousRecords = records;
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, notes } : r))
      );

      try {
        const res = await fetch(`/api/outreach/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });

        if (!res.ok) {
          setRecords(previousRecords);
          const json = await res.json();
          throw new Error(json.error || "Failed to update notes");
        }
      } catch (err) {
        setRecords(previousRecords);
        setError(err instanceof Error ? err.message : "Failed to update");
        throw err;
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [records]
  );

  const updateAmount = useCallback(
    async (id: string, amount: number) => {
      setUpdatingIds((prev) => new Set(prev).add(id));

      const previousRecords = records;
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, amount: String(amount) } : r))
      );

      try {
        const res = await fetch(`/api/outreach/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        if (!res.ok) {
          setRecords(previousRecords);
          const json = await res.json();
          throw new Error(json.error || "Failed to update amount");
        }
      } catch (err) {
        setRecords(previousRecords);
        setError(err instanceof Error ? err.message : "Failed to update");
        throw err;
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [records]
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      setUpdatingIds((prev) => new Set(prev).add(id));

      const previousRecords = records;
      const previousStats = stats;
      const deletedRecord = records.find((r) => r.id === id);

      setRecords((prev) => prev.filter((r) => r.id !== id));

      if (deletedRecord) {
        setStats((prev) => ({
          ...prev,
          [deletedRecord.status as OutreachStatus]: Math.max(0, prev[deletedRecord.status as OutreachStatus] - 1),
        }));
      }

      try {
        const res = await fetch(`/api/outreach/${id}`, { method: "DELETE" });

        if (!res.ok) {
          setRecords(previousRecords);
          setStats(previousStats);
          const json = await res.json();
          throw new Error(json.error || "Failed to delete record");
        }
      } catch (err) {
        setRecords(previousRecords);
        setStats(previousStats);
        setError(err instanceof Error ? err.message : "Failed to delete");
        throw err;
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [records, stats]
  );

  const totalCount = useMemo(() => {
    return Object.values(stats).reduce((sum, count) => sum + count, 0);
  }, [stats]);

  return {
    records,
    stats,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    updateStatus,
    updateNotes,
    updateAmount,
    deleteRecord,
    isUpdating,
    totalCount,
    refetch: fetchOutreach,
  };
}
