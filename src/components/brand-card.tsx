"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ExternalLink, TrendingUp, Users, Sparkles, CheckCircle2 } from "lucide-react";
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
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  return "fair";
}

function getMatchLabel(score: number): string {
  if (score >= 85) return "Perfect Match";
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Good";
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
      <Card className="relative overflow-hidden border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-300 ease-out">
        {/* Subtle gradient accent on hover */}
        <div className="absolute inset-0 bg-[image:var(--gradient-subtle)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative p-5">
          {/* Top row: Avatar + Info + Save */}
          <div className="flex items-start gap-3.5 mb-4">
            {/* Brand Avatar */}
            <div className="relative shrink-0">
              <div className="rounded-xl overflow-hidden ring-2 ring-[var(--border)] group-hover:ring-[var(--accent)] transition-all duration-300">
                {brand.profilePicture ? (
                  <Image
                    src={brand.profilePicture}
                    alt={brand.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[image:var(--gradient-brand)] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {brand.isVerifiedAccount && (
                <div className="absolute -bottom-1 -right-1">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[var(--accent-secondary)] fill-[var(--surface)]" />
                </div>
              )}
            </div>

            {/* Name, username, activity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate leading-tight">
                  {brand.name}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`activity-dot ${activity.class}`} />
                  <span className="text-[0.6875rem] text-[var(--muted)] hidden sm:inline leading-none">
                    {activity.label}
                  </span>
                </div>
              </div>
              {brand.instagramUsername && (
                <p className="text-sm text-[var(--muted)] truncate mt-0.5">
                  @{brand.instagramUsername}
                </p>
              )}
            </div>

            {/* Save button - top right */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSave}
              disabled={isSaving}
              className={`shrink-0 rounded-full ${isSaved ? "text-[var(--accent-secondary)] bg-[var(--accent-secondary-light)]" : "text-[var(--muted)] hover:text-[var(--accent-secondary)]"}`}
              title={isSaved ? "Remove from saved" : "Save brand"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""} ${isSaving ? "animate-pulse" : ""}`} />
            </Button>
          </div>

          {/* Category & Niche badges */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {brand.category && (
              <Badge variant="default" className="text-[0.6875rem]">{brand.category}</Badge>
            )}
            {brand.niche && brand.niche !== brand.category && (
              <Badge variant="muted" className="text-[0.6875rem]">{brand.niche}</Badge>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {formatFollowers(brand.followers)}
              </span>
              <span className="text-xs text-[var(--muted)]">followers</span>
            </div>
            <div className="w-px h-3.5 bg-[var(--border)]" />
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {brand.partnershipCount || 0}
              </span>
              <span className="text-xs text-[var(--muted)]">collabs</span>
            </div>
          </div>

          {/* Match Score */}
          {showMatchScore && matchScore > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      matchClass === "excellent"
                        ? "text-[var(--success)]"
                        : matchClass === "good"
                          ? "text-[var(--accent)]"
                          : "text-[var(--warning)]"
                    }`}
                  />
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
                </div>
                <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">
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
                <p className="text-xs text-[var(--muted)] mt-2 truncate leading-relaxed">
                  {brand.matchReasons[0]}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
            <Button variant="outline" size="sm" className="flex-1 text-xs font-medium">
              View Details
            </Button>
            {brand.instagramUsername && (
              <Button
                variant="ghost"
                size="icon-sm"
                title="View on Instagram"
                className="text-[var(--muted)] hover:text-[var(--accent-secondary)]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(
                    `https://instagram.com/${brand.instagramUsername}`,
                    "_blank"
                  );
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
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
      className="group flex items-center gap-3.5 p-3.5 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 animate-slide-in opacity-0"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="rounded-lg overflow-hidden">
          {brand.profilePicture ? (
            <Image
              src={brand.profilePicture}
              alt={brand.name}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-[image:var(--gradient-brand)] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 activity-dot ${activity.class}`}
          style={{ width: "6px", height: "6px" }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-medium text-sm text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
            {brand.name}
          </h4>
          {brand.isVerifiedAccount && (
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-secondary)] shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-[var(--muted)] truncate">
            {brand.category || brand.niche || "Brand"}
          </span>
          <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted)] shrink-0" />
          <span className="text-xs font-medium text-[var(--muted)] shrink-0">
            {formatFollowers(brand.followers)}
          </span>
          {(brand.partnershipCount ?? 0) > 0 && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted)] shrink-0" />
              <span className="text-xs text-[var(--muted)] shrink-0">
                {brand.partnershipCount} collabs
              </span>
            </>
          )}
        </div>
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
          className="tabular-nums"
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
        className={`shrink-0 rounded-full ${isSaved ? "text-[var(--accent-secondary)] bg-[var(--accent-secondary-light)]" : "text-[var(--muted)] hover:text-[var(--accent-secondary)]"}`}
      >
        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""} ${isSaving ? "animate-pulse" : ""}`} />
      </Button>
    </Link>
  );
}
