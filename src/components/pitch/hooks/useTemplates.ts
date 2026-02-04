"use client";

import { useState, useCallback, useEffect } from "react";

export interface PitchTemplate {
  id: string;
  userId: string;
  name: string;
  subject: string;
  body: string;
  tone: string | null;
  category: string | null;
  isFavorite: boolean | null;
  usageCount: number | null;
  createdAt: string;
  updatedAt: string;
}

interface UseTemplatesOptions {
  userId: string | null;
}

export function useTemplates({ userId }: UseTemplatesOptions) {
  const [templates, setTemplates] = useState<PitchTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pitch/templates?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Failed to fetch templates");
      const json = await res.json();
      setTemplates(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const saveTemplate = useCallback(
    async (data: { name: string; subject: string; body: string; tone?: string; category?: string }) => {
      if (!userId) throw new Error("User ID required");

      const res = await fetch("/api/pitch/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save template");
      }

      const json = await res.json();
      setTemplates((prev) => [json.data, ...prev]);
      return json.data as PitchTemplate;
    },
    [userId]
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (!userId) throw new Error("User ID required");

      const res = await fetch(`/api/pitch/templates?id=${templateId}&userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete template");
      }

      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    },
    [userId]
  );

  const incrementUsage = useCallback(
    async (templateId: string) => {
      if (!userId) return;

      await fetch("/api/pitch/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: templateId, userId, incrementUsage: true }),
      });
    },
    [userId]
  );

  const toggleFavorite = useCallback(
    async (templateId: string, isFavorite: boolean) => {
      if (!userId) return;

      const res = await fetch("/api/pitch/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: templateId, userId, isFavorite }),
      });

      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? { ...t, isFavorite } : t))
        );
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    saveTemplate,
    deleteTemplate,
    incrementUsage,
    toggleFavorite,
  };
}
