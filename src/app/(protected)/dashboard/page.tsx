"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users,
  Target,
  Instagram,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface CreatorProfile {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  bio: string | null;
  profilePicture: string | null;
  lastSyncedAt: string | null;
}

const navItems = [
  { href: "/dashboard", icon: Sparkles, label: "For You", active: true },
  { href: "/dashboard/search", icon: Search, label: "Search" },
  { href: "/dashboard/favorites", icon: Heart, label: "Favorites" },
  { href: "/dashboard/alerts", icon: Bell, label: "Alerts" },
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getCreatorTier(followers: number): string {
  if (followers >= 1000000) return "Mega";
  if (followers >= 100000) return "Macro";
  if (followers >= 10000) return "Mid-tier";
  if (followers >= 1000) return "Micro";
  return "Nano";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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

    setIsSyncing(true);
    try {
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
    } catch (error) {
      console.error("Resync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const hasProfile = profile?.instagramUsername;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              NextCollab
            </span>
          </Link>
        </div>

        {/* Creator card in sidebar */}
        {hasProfile && (
          <div className="px-4 pt-4">
            <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.instagramUsername || ""}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                    {profile.instagramUsername?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    @{profile.instagramUsername}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatNumber(profile.followers || 0)} followers
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    item.active
                      ? "bg-[var(--accent-light)] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-[var(--border)]">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              NextCollab
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--surface-elevated)]"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="absolute top-full left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] p-4 animate-fade-in">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.active
                        ? "bg-[var(--accent-light)] text-[var(--accent)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-[var(--border)] pt-2 mt-2">
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign out</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Welcome header */}
          <div className="mb-8">
            <h1
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome back,{" "}
              {session?.user?.name?.split(" ")[0] || "Creator"}
            </h1>
            <p className="text-[var(--muted)]">
              {hasProfile
                ? "Here are your personalized brand matches for today."
                : "Connect your Instagram to unlock AI-powered brand matches."}
            </p>
          </div>

          {profileLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
            </div>
          ) : hasProfile ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[var(--muted)]">
                      Followers
                    </span>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {formatNumber(profile.followers || 0)}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {getCreatorTier(profile.followers || 0)} creator
                  </p>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[var(--muted)]">
                      Engagement
                    </span>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {profile.engagementRate
                      ? `${profile.engagementRate}%`
                      : "---"}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {profile.engagementRate
                      ? Number(profile.engagementRate) >= 3
                        ? "Above average"
                        : "Room to grow"
                      : "Analyzing..."}
                  </p>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[var(--muted)]">Niche</span>
                    <Target className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div
                    className="text-3xl font-bold capitalize"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {profile.niche || "---"}
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {profile.niche
                      ? "Detected from your content"
                      : "Not enough data yet"}
                  </p>
                </div>
              </div>

              {/* Profile summary + resync */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">
                        @{profile.instagramUsername}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {profile.lastSyncedAt
                          ? `Last synced ${new Date(profile.lastSyncedAt).toLocaleDateString()}`
                          : "Never synced"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleResync}
                    disabled={isSyncing}
                    className="btn btn-secondary text-sm py-2 px-4 disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {isSyncing ? "Syncing..." : "Resync"}
                  </button>
                </div>
              </div>

              {/* Matches placeholder */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-[var(--accent)]" />
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Brand matches coming soon
                </h2>
                <p className="text-[var(--muted)] max-w-md mx-auto">
                  We&apos;re building your personalized brand database. Your
                  AI-powered matches will appear here once our brand sync is
                  complete.
                </p>
              </div>
            </>
          ) : (
            /* Empty state - no profile */
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Complete your profile
              </h2>
              <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
                Add your Instagram username to unlock AI-powered brand matches
                tailored to your content and audience.
              </p>
              <Link href="/onboarding" className="btn btn-primary">
                <Instagram className="w-5 h-5" />
                Connect Instagram
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
