"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export interface ProfileData {
  username: string;
  fullName: string;
  bio: string | null;
  followers: number;
  following: number;
  postsCount: number;
  profilePicture: string | null;
  isVerified: boolean;
}

export interface MetricsData {
  engagementRate: number | null;
  avgViews: number | null;
  avgLikes: number | null;
  avgComments: number | null;
  postFrequency: number | null;
  postTypeMix: { reels: number; images: number; carousels: number } | null;
  postsAnalyzed: number | null;
  viewToFollowerRatio: number | null;
  recentHashtags: string[];
}

export interface AiData {
  contentThemes: string[] | null;
  subNiches: string[] | null;
  primaryLanguage: string | null;
  locationDisplay: string | null;
  countryCode: string | null;
}

type EnrichmentStatus = "idle" | "connecting" | "streaming" | "done" | "error";

interface UseEnrichmentStreamReturn {
  status: EnrichmentStatus;
  progress: number;
  profile: ProfileData | null;
  metrics: MetricsData | null;
  ai: AiData | null;
  error: string | null;
  retry: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const MAX_RETRIES = 3;

export function useEnrichmentStream(
  username: string | null,
  userId: string | null
): UseEnrichmentStreamReturn {
  const [status, setStatus] = useState<EnrichmentStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [ai, setAi] = useState<AiData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(
    (user: string, uid: string) => {
      cleanup();
      setStatus("connecting");
      setError(null);

      const url = `/api/instagram/enrich-stream?username=${encodeURIComponent(user)}&userId=${encodeURIComponent(uid)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("phase", (event) => {
        try {
          const data = JSON.parse(event.data);
          const phase = data.phase as string;
          const phaseProgress = data.progress as number;
          const phaseData = data.data;

          retryRef.current = 0; // reset retries on success
          setStatus("streaming");
          setProgress(phaseProgress);

          if (phase === "profile") {
            setProfile(phaseData as ProfileData);
            toast.success("Profile loaded", {
              description: `${formatNumber(phaseData.followers)} followers`,
            });
          } else if (phase === "metrics") {
            setMetrics(phaseData as MetricsData);
            toast.success("Content analyzed", {
              description: `${phaseData.postsAnalyzed} posts analyzed`,
            });
          } else if (phase === "ai") {
            setAi(phaseData as AiData);
            const niche = phaseData.contentThemes?.[0] || "your niche";
            toast.success("AI analysis complete", {
              description: `Detected: ${niche}`,
            });
          }
        } catch (e) {
          console.error("[enrichment-stream] Failed to parse phase event:", e);
        }
      });

      es.addEventListener("done", () => {
        setStatus("done");
        setProgress(100);
        cleanup();
      });

      es.addEventListener("error", (event) => {
        // Custom error event from our backend (has data)
        if (event instanceof MessageEvent && event.data) {
          try {
            const data = JSON.parse(event.data);
            toast.error(`${data.phase} failed`, {
              description: data.message,
            });
          } catch {
            // not parseable, fall through
          }
          return;
        }

        // Native EventSource connection error — retry with backoff
        cleanup();
        const attempt = retryRef.current;
        if (attempt < MAX_RETRIES) {
          retryRef.current = attempt + 1;
          const delay = Math.pow(2, attempt) * 1000;
          console.log(
            `[enrichment-stream] Retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`
          );
          retryTimerRef.current = setTimeout(() => connect(user, uid), delay);
        } else {
          setStatus("error");
          setError("Connection lost. Please try again.");
        }
      });
    },
    [cleanup]
  );

  // Start SSE when username/userId become available
  useEffect(() => {
    if (!username || !userId) return;
    retryRef.current = 0;
    connect(username, userId);
    return cleanup;
  }, [username, userId, connect, cleanup]);

  const retry = useCallback(() => {
    if (!username || !userId) return;
    retryRef.current = 0;
    setProgress(0);
    setProfile(null);
    setMetrics(null);
    setAi(null);
    setError(null);
    connect(username, userId);
  }, [username, userId, connect]);

  return { status, progress, profile, metrics, ai, error, retry };
}
