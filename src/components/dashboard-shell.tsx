"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Sparkles,
  Search,
  Kanban,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useState, ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

interface CreatorProfile {
  id: string;
  instagramUsername: string | null;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  profilePicture: string | null;
}

interface DashboardShellProps {
  children: ReactNode;
  profile: CreatorProfile | null;
  profileLoading?: boolean;
  onResync?: () => Promise<void>;
}

const navItems = [
  { href: "/dashboard", icon: Sparkles, label: "For You" },
  { href: "/dashboard/discover", icon: Search, label: "Discover" },
  { href: "/dashboard/pipeline", icon: Kanban, label: "Pipeline" },
  { href: "/dashboard/saved", icon: Heart, label: "Saved" },
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function DashboardShell({
  children,
  profile,
  profileLoading = false,
  onResync,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleResync = async () => {
    if (!onResync) return;
    setIsSyncing(true);
    try {
      await onResync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[var(--surface)] border-r border-[var(--border)] flex-col z-40">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-lg font-semibold">NextCollab</span>
          </Link>
        </div>

        {/* Profile Card */}
        {!profileLoading && profile?.instagramUsername && (
          <div className="px-4 pt-4">
            <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.instagramUsername}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "var(--instagram-gradient)" }}
                  >
                    {profile.instagramUsername.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    @{profile.instagramUsername}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatNumber(profile.followers || 0)} followers
                  </p>
                </div>
                {onResync && (
                  <button
                    onClick={handleResync}
                    disabled={isSyncing}
                    className="p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all disabled:opacity-50"
                    title="Resync profile"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 pt-6">
          <p className="px-3 mb-3 text-[10px] font-medium tracking-wider uppercase text-[var(--muted)]">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive(item.href)
                      ? "bg-[var(--accent-light)] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[var(--border)] space-y-2">
          {/* Theme Toggle */}
          <div className="px-3 py-2">
            <p className="text-[10px] font-medium tracking-wider uppercase text-[var(--muted)] mb-2">
              Theme
            </p>
            <ThemeToggle variant="compact" />
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] transition-all"
          >
            <Settings className="w-[18px] h-[18px]" />
            <span className="font-medium text-sm">Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--muted)] hover:bg-[var(--error-light)] hover:text-[var(--error)] transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="font-medium text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 frosted border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-semibold">NextCollab</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="absolute top-full left-0 right-0 frosted border-b border-[var(--border)] p-4 animate-fade-in">
            {profile?.instagramUsername && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border)]">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.instagramUsername}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "var(--instagram-gradient)" }}
                  >
                    {profile.instagramUsername.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">@{profile.instagramUsername}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatNumber(profile.followers || 0)} followers
                  </p>
                </div>
              </div>
            )}
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.href)
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign out</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Mobile Bottom Tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 frosted border-t border-[var(--border)] safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive(item.href) ? "text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-24 lg:pb-8 min-h-screen">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
