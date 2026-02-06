"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Users,
  BarChart2,
  Zap,
  Globe,
  Activity,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FitAnalysis } from "@/lib/fit-analysis";

interface FitAnalysisCardProps {
  brandId: string;
  userId: string;
  /** Pre-fetched fit analysis data to avoid double-fetching */
  prefetchedAnalysis?: FitAnalysis | null;
}

function formatNumber(n: number | null | undefined): string {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-[var(--success)]";
  if (score >= 60) return "text-[var(--accent)]";
  if (score >= 40) return "text-[var(--warning)]";
  return "text-[var(--muted)]";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-[var(--success)]/10";
  if (score >= 60) return "bg-[var(--accent)]/10";
  if (score >= 40) return "bg-[var(--warning)]/10";
  return "bg-[var(--surface-elevated)]";
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--muted)]">{label}</span>
        <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
      </div>
      <div className="h-1.5 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? "bg-[var(--success)]" : score >= 60 ? "bg-[var(--accent)]" : score >= 40 ? "bg-[var(--warning)]" : "bg-[var(--muted)]"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface CategoryItemProps {
  icon: React.ElementType;
  title: string;
  score: number;
  explanation: string;
  detail?: string;
}

function CategoryItem({ icon: Icon, title, score, explanation, detail }: CategoryItemProps) {
  return (
    <div className="p-4 rounded-xl bg-[var(--surface-elevated)] hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getScoreBgColor(score)}`}>
          <Icon className={`w-4 h-4 ${getScoreColor(score)}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{title}</span>
            <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
          </div>
          <p className="text-xs text-[var(--muted)] line-clamp-2">{explanation}</p>
          {detail && (
            <p className="text-xs text-[var(--foreground)] mt-1 font-medium">{detail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function FitAnalysisCard({ brandId, userId, prefetchedAnalysis }: FitAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<FitAnalysis | null>(prefetchedAnalysis ?? null);
  const [loading, setLoading] = useState(!prefetchedAnalysis);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetch if we already have prefetched data
    if (prefetchedAnalysis) {
      setAnalysis(prefetchedAnalysis);
      setLoading(false);
      return;
    }

    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/brands/${brandId}/fit?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) {
          throw new Error("Failed to fetch fit analysis");
        }
        const json = await res.json();
        setAnalysis(json.data);
      } catch (err) {
        console.error("Fit analysis error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [brandId, userId, prefetchedAnalysis]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--muted)]">Analyzing fit...</p>
        </div>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="w-8 h-8 text-[var(--warning)] mb-4" />
          <p className="text-sm text-[var(--muted)]">
            {error || "Unable to calculate fit analysis"}
          </p>
        </div>
      </Card>
    );
  }

  const { overallScore, overallStatus, warnings, strengths } = analysis;

  return (
    <div className="space-y-4">
      {/* Overall Score Card */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          {/* Score Circle */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${getScoreBgColor(overallScore)} ${getScoreColor(overallScore)}`}
          >
            {overallScore}%
          </div>

          {/* Status & Summary */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">
                {overallStatus === "excellent" && "Excellent Match"}
                {overallStatus === "good" && "Strong Match"}
                {overallStatus === "fair" && "Potential Match"}
                {overallStatus === "low" && "Limited Match"}
              </h3>
              <Badge
                variant={
                  overallStatus === "excellent" ? "success" :
                  overallStatus === "good" ? "default" :
                  overallStatus === "fair" ? "warning" : "secondary"
                }
              >
                {overallStatus}
              </Badge>
            </div>
            <p className="text-sm text-[var(--muted)] mt-1">
              Based on detailed analysis of your profile and their partnership history
            </p>
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
              Why you&apos;re a good fit
            </h4>
            <div className="space-y-2">
              {strengths.slice(0, 4).map((strength, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
              Things to consider
            </h4>
            <div className="space-y-2">
              {warnings.slice(0, 3).map((warning, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
                  <span className="text-[var(--muted)]">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
          Detailed Analysis
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CategoryItem
            icon={Users}
            title="Creator Similarity"
            score={analysis.creatorSimilarity.score}
            explanation={analysis.creatorSimilarity.explanation}
            detail={analysis.creatorSimilarity.smallestCreatorSize
              ? `Smallest partner: ${formatNumber(analysis.creatorSimilarity.smallestCreatorSize)} followers`
              : undefined
            }
          />

          <CategoryItem
            icon={TrendingUp}
            title="Size Match"
            score={analysis.sizeMatch.score}
            explanation={analysis.sizeMatch.explanation}
          />

          <CategoryItem
            icon={BarChart2}
            title="Performance"
            score={analysis.performanceMatch.score}
            explanation={analysis.performanceMatch.explanation}
          />

          <CategoryItem
            icon={Target}
            title="Content Alignment"
            score={analysis.contentAlignment.score}
            explanation={analysis.contentAlignment.explanation}
            detail={analysis.contentAlignment.matchingThemes.length > 0
              ? `Matching: ${analysis.contentAlignment.matchingThemes.slice(0, 3).join(", ")}`
              : undefined
            }
          />

          <CategoryItem
            icon={Globe}
            title="Language Fit"
            score={analysis.languageFit.score}
            explanation={analysis.languageFit.explanation}
          />

          <CategoryItem
            icon={Activity}
            title="Brand Activity"
            score={analysis.activitySignal.score}
            explanation={analysis.activitySignal.explanation}
          />

          <CategoryItem
            icon={Shield}
            title="Trust Signals"
            score={analysis.trustSignals.score}
            explanation={analysis.trustSignals.explanation}
          />
        </div>
      </Card>

      {/* Score Breakdown Bars */}
      <Card className="p-6">
        <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
          Score Breakdown
        </h4>
        <div className="space-y-3">
          <ScoreBar score={analysis.creatorSimilarity.score} label="Creator Similarity (20%)" />
          <ScoreBar score={analysis.sizeMatch.score} label="Size Match (20%)" />
          <ScoreBar score={analysis.performanceMatch.score} label="Performance (15%)" />
          <ScoreBar score={analysis.contentAlignment.score} label="Content Alignment (15%)" />
          <ScoreBar score={analysis.activitySignal.score} label="Brand Activity (15%)" />
          <ScoreBar score={analysis.languageFit.score} label="Language Fit (10%)" />
          <ScoreBar score={analysis.trustSignals.score} label="Trust Signals (5%)" />
        </div>
      </Card>
    </div>
  );
}
