"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Kanban,
  Send,
  MessageSquare,
  CheckCircle,
  Trophy,
  XCircle,
  Ghost,
  Search,
  Loader2,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusCard } from "@/components/pipeline/status-card";
import { OutreachCard } from "@/components/pipeline/outreach-card";
import { useOutreach, OutreachStatus } from "@/hooks/use-outreach";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

interface CreatorProfile {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  profilePicture: string | null;
}

const STATUS_CONFIG: {
  status: OutreachStatus | "all";
  label: string;
  color: string;
  icon: typeof Send;
}[] = [
  { status: "all", label: "All", color: "var(--foreground)", icon: LayoutGrid },
  { status: "pitched", label: "Pitched", color: "var(--accent-secondary)", icon: Send },
  { status: "negotiating", label: "Negotiating", color: "var(--warning)", icon: MessageSquare },
  { status: "confirmed", label: "Confirmed", color: "var(--success)", icon: CheckCircle },
  { status: "completed", label: "Completed", color: "var(--success)", icon: Trophy },
  { status: "rejected", label: "Rejected", color: "var(--error)", icon: XCircle },
  { status: "ghosted", label: "Ghosted", color: "var(--muted)", icon: Ghost },
];

export default function PipelinePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const {
    records,
    stats,
    isLoading,
    statusFilter,
    setStatusFilter,
    updateStatus,
    updateNotes,
    deleteRecord,
    isUpdating,
    totalCount,
  } = useOutreach(session?.user?.id);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(
        `/api/instagram/me?userId=${encodeURIComponent(session.user.id)}`
      );
      if (res.ok) {
        const json = await res.json();
        setProfile(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleResync = async () => {
    if (!profile?.instagramUsername || !session?.user?.id) return;
    const res = await fetch(
      `/api/instagram/profile?username=${encodeURIComponent(profile.instagramUsername)}`
    );
    if (res.ok) {
      const json = await res.json();
      await fetch("/api/instagram/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          profile: json.data,
        }),
      });
      await fetchProfile();
    }
  };

  // Calculate active (non-terminal) deals
  const activeDeals = stats.pitched + stats.negotiating + stats.confirmed;
  const wonDeals = stats.completed;

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      {/* Page Header */}
      <header className="mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Kanban className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl font-semibold tracking-tight">
                Your <span className="italic text-primary">Pipeline</span>
              </h1>
              <p className="text-muted-foreground">
                {totalCount > 0 ? (
                  <>
                    <NumberTicker value={activeDeals} className="text-foreground font-semibold" /> active deals
                    {wonDeals > 0 && (
                      <span className="text-success"> · {wonDeals} won</span>
                    )}
                  </>
                ) : (
                  "Track your brand outreach progress"
                )}
              </p>
            </div>
          </div>

          <Button asChild>
            <Link href="/brand">
              <Search className="w-4 h-4" />
              Find Brands to Pitch
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="mb-8 animate-fade-up opacity-0" style={{ animationDelay: "50ms", animationFillMode: "forwards" }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATUS_CONFIG.filter((c) => c.status !== "all").map((config, idx) => {
            const count = config.status === "all" ? totalCount : stats[config.status];
            return (
              <BlurFade key={config.status} delay={0.05 * idx}>
                <StatusCard
                  label={config.label}
                  count={count}
                  icon={config.icon}
                  color={config.color}
                  isActive={statusFilter === config.status}
                  onClick={() => setStatusFilter(config.status === statusFilter ? "all" : config.status)}
                />
              </BlurFade>
            );
          })}
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-2 flex-wrap animate-fade-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        {STATUS_CONFIG.map((config) => {
          const count = config.status === "all" ? totalCount : stats[config.status];
          const isActive = statusFilter === config.status;
          return (
            <button
              key={config.status}
              onClick={() => setStatusFilter(config.status)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-foreground"
              )}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
              <span className={cn(
                "px-1.5 py-0.5 rounded text-xs",
                isActive ? "bg-primary-foreground/20" : "bg-muted"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Loading your pipeline...</p>
          </div>
        </div>
      ) : records.length === 0 ? (
        <BlurFade delay={0.1}>
          <Card className="p-12 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Kanban className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {statusFilter === "all"
                ? "No pitches yet"
                : `No ${STATUS_CONFIG.find((c) => c.status === statusFilter)?.label.toLowerCase()} pitches`}
            </h2>
            <p className="text-muted-foreground mb-6">
              {statusFilter === "all"
                ? "Start pitching brands to see your outreach progress here. Use the pitch wizard to create and send personalized pitches."
                : "Change your filter or start pitching more brands!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {statusFilter !== "all" && (
                <Button variant="outline" onClick={() => setStatusFilter("all")}>
                  View All
                </Button>
              )}
              <Button size="lg" asChild>
                <Link href="/brand">
                  Find Brands to Pitch
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </BlurFade>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => (
            <OutreachCard
              key={record.id}
              record={record}
              onStatusChange={updateStatus}
              onNotesChange={updateNotes}
              onDelete={deleteRecord}
              isUpdating={isUpdating(record.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
