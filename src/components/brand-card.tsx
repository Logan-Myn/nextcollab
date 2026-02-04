"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ExternalLink, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface BrandData {
  id: string;
  name: string;
  instagramUsername: string | null;
  category: string | null;
  niche: string | null;
  followers: number | null;
  partnershipCount: number | null;
  activityScore: number | null;
  bio: string | null;
  isVerifiedAccount: boolean | null;
  profilePicture?: string | null;
  matchScore?: number;
  matchReasons?: string[];
}

interface BrandCardProps {
  brand: BrandData;
  onSave?: (brandId: string) => void;
  isSaved?: boolean;
  isSaving?: boolean;
  showMatchScore?: boolean;
  index?: number;
}

function getActivityLevel(
  score: number | null,
  partnershipCount: number | null
): {
  label: string;
  class: string;
} {
  const count = partnershipCount || 0;
  if (count >= 5) return { label: "Very Active", class: "active" };
  if (count >= 1) return { label: "Active", class: "moderate" };
  return { label: "Quiet", class: "quiet" };
}

function getMatchClass(score: number): string {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  return "fair";
}

function getMatchLabel(score: number): string {
  if (score >= 90) return "Perfect Match";
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Good";
  return "Potential";
}

function formatFollowers(n: number | null): string {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function BrandCard({
  brand,
  onSave,
  isSaved = false,
  isSaving = false,
  showMatchScore = true,
  index = 0,
}: BrandCardProps) {
  const activity = getActivityLevel(brand.activityScore, brand.partnershipCount);
  const matchScore = brand.matchScore || 0;
  const matchClass = getMatchClass(matchScore);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      try {
        await onSave(brand.id);
      } catch (err) {
        console.error("[BrandCard] Save error:", err);
      }
    }
  };

  const animationDelay = `${index * 50}ms`;

  return (
    <Link
      href={`/brand/${brand.instagramUsername || brand.id}`}
      className="group block animate-fade-up opacity-0"
      style={{ animationDelay, animationFillMode: "forwards" }}
    >
      <Card className="overflow-hidden hover:border-primary hover:-translate-y-0.5 transition-all">
      <div className="p-5">
        {/* Header: Logo + Name + Activity */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Brand Avatar */}
            <div className="relative">
              {brand.profilePicture ? (
                <Image
                  src={brand.profilePicture}
                  alt={brand.name}
                  width={44}
                  height={44}
                  unoptimized
                  className="w-11 h-11 rounded-lg object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {brand.isVerifiedAccount && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent-secondary)] rounded-full flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Name & Username */}
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                {brand.name}
              </h3>
              {brand.instagramUsername && (
                <p className="text-sm text-[var(--muted)] truncate">
                  @{brand.instagramUsername}
                </p>
              )}
            </div>
          </div>

          {/* Activity Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`activity-dot ${activity.class}`} />
            <span className="text-xs text-[var(--muted)] hidden sm:inline">
              {activity.label}
            </span>
          </div>
        </div>

        {/* Category & Niche */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {brand.category && (
            <Badge variant="default">{brand.category}</Badge>
          )}
          {brand.niche && brand.niche !== brand.category && (
            <Badge variant="muted">{brand.niche}</Badge>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">{formatFollowers(brand.followers)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium">
              {brand.partnershipCount || 0} collabs
            </span>
          </div>
        </div>

        {/* Match Score - Simple progress bar */}
        {showMatchScore && matchScore > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--surface-elevated)]">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-semibold ${
                  matchClass === "excellent"
                    ? "text-[var(--success)]"
                    : matchClass === "good"
                      ? "text-[var(--accent)]"
                      : "text-[var(--warning)]"
                }`}
              >
                {getMatchLabel(matchScore)}
              </span>
              <span className="text-sm font-bold text-[var(--foreground)]">
                {matchScore}%
              </span>
            </div>
            <div className="match-bar">
              <div
                className={`match-bar-fill ${matchClass}`}
                style={{ width: `${matchScore}%` }}
              />
            </div>
            {brand.matchReasons && brand.matchReasons[0] && (
              <p className="text-xs text-[var(--muted)] mt-2 truncate">
                {brand.matchReasons[0]}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSave}
            disabled={isSaving}
            className={isSaved ? "text-primary bg-[var(--accent-light)]" : ""}
            title={isSaved ? "Remove from saved" : "Save brand"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""} ${isSaving ? "animate-pulse" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            View Details
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="View on Instagram"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (brand.instagramUsername) {
                window.open(
                  `https://instagram.com/${brand.instagramUsername}`,
                  "_blank"
                );
              }
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      </Card>
    </Link>
  );
}

// Compact version for lists
export function BrandCardCompact({
  brand,
  onSave,
  isSaved = false,
  isSaving = false,
  index = 0,
}: Omit<BrandCardProps, "showMatchScore">) {
  const activity = getActivityLevel(brand.activityScore, brand.partnershipCount);
  const matchScore = brand.matchScore || 0;
  const matchClass = getMatchClass(matchScore);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      try {
        await onSave(brand.id);
      } catch (err) {
        console.error("[BrandCard] Save error:", err);
      }
    }
  };

  return (
    <Link
      href={`/brand/${brand.instagramUsername || brand.id}`}
      className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-all group animate-slide-in opacity-0"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {brand.profilePicture ? (
          <Image
            src={brand.profilePicture}
            alt={brand.name}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-semibold">
              {brand.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 activity-dot ${activity.class}`}
          style={{ width: "6px", height: "6px" }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
          {brand.name}
        </h4>
        <p className="text-xs text-[var(--muted)] truncate">
          {brand.category || brand.niche || "Brand"} ·{" "}
          {formatFollowers(brand.followers)}
        </p>
      </div>

      {/* Match Score Badge */}
      {matchScore > 0 && (
        <Badge
          variant={
            matchClass === "excellent"
              ? "success"
              : matchClass === "good"
                ? "default"
                : "warning"
          }
        >
          {matchScore}%
        </Badge>
      )}

      {/* Save button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleSave}
        disabled={isSaving}
        className={isSaved ? "text-primary" : ""}
      >
        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""} ${isSaving ? "animate-pulse" : ""}`} />
      </Button>
    </Link>
  );
}
