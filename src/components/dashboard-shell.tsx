"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Home,
  Search,
  Kanban,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Loader2,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useState, ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/brand", icon: Search, label: "Brands" },
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

  // Get current page title
  const getCurrentPageTitle = () => {
    const current = navItems.find(item => isActive(item.href));
    return current?.label || "Home";
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ========== DESKTOP ICON RAIL ========== */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] bg-[var(--surface)] border-r border-[var(--border)] flex-col items-center z-40">
        {/* Logo */}
        <div className="py-5 w-full flex justify-center border-b border-[var(--border)]">
          <Link href="/" className="rail-logo group">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(131,58,180,0.4)]">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </Link>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 py-4 w-full flex flex-col items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rail-item group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-[var(--accent-light)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
              }`}
            >
              {/* Active indicator bar */}
              {isActive(item.href) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--accent)] rounded-r-full animate-slide-in" />
              )}
              <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {/* Tooltip */}
              <span className="rail-tooltip absolute left-full ml-3 px-3 py-1.5 bg-[var(--foreground)] text-[var(--background)] text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="py-4 w-full flex flex-col items-center gap-1 border-t border-[var(--border)]">
          <Link
            href="/settings"
            className={`rail-item group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
              pathname === "/settings"
                ? "bg-[var(--accent-light)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
            }`}
          >
            <Settings className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="rail-tooltip absolute left-full ml-3 px-3 py-1.5 bg-[var(--foreground)] text-[var(--background)] text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              Settings
            </span>
          </Link>
        </div>
      </aside>

      {/* ========== DESKTOP TOP BAR ========== */}
      <header className="hidden lg:flex fixed top-0 left-[72px] right-0 h-16 bg-[var(--surface)] border-b border-[var(--border)] items-center justify-between px-6 z-30">
        {/* Left: Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search brands, niches..."
              className="w-full h-10 pl-10 pr-4 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-sm placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] transition-all"
            />
          </div>
        </div>

        {/* Right: Actions + Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Action Button */}
          <Link
            href="/brand"
            className="flex items-center gap-2 px-4 h-9 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-dark)] transition-all hover:shadow-[0_4px_12px_rgba(131,58,180,0.3)] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Find Brands</span>
          </Link>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 px-2 py-1.5">
                {profile?.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.instagramUsername || "Profile"}
                    width={32}
                    height={32}
                    unoptimized
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--border)]"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--border)]"
                    style={{ background: "var(--instagram-gradient)" }}
                  >
                    {profile?.instagramUsername?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                {profile?.instagramUsername && (
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    @{profile.instagramUsername}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* Profile Header */}
              {profile?.instagramUsername && (
                <>
                  <DropdownMenuLabel className="p-4">
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
                        <p className="text-sm font-semibold truncate">
                          @{profile.instagramUsername}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(profile.followers || 0)} followers
                        </p>
                      </div>
                      {onResync && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleResync}
                          disabled={isSyncing}
                          title="Resync profile"
                        >
                          {isSyncing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Theme Toggle */}
              <div className="p-3">
                <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-2 px-1">
                  Theme
                </p>
                <ThemeToggle variant="compact" />
              </div>
              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ========== MOBILE HEADER ========== */}
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

      {/* ========== MOBILE BOTTOM TABS ========== */}
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

      {/* ========== MAIN CONTENT ========== */}
      <main className="lg:ml-[72px] lg:pt-16 pt-16 pb-24 lg:pb-8 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
