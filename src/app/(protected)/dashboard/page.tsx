"use client";

import Link from "next/link";
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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: Sparkles, label: "For You", active: true },
  { href: "/dashboard/search", icon: Search, label: "Search" },
  { href: "/dashboard/favorites", icon: Heart, label: "Favorites" },
  { href: "/dashboard/alerts", icon: Bell, label: "Alerts" },
];

const stats = [
  { label: "Match Score", value: "87%", icon: Target, color: "text-green-500" },
  { label: "New Matches", value: "12", icon: TrendingUp, color: "text-[var(--accent)]" },
  { label: "Saved Brands", value: "5", icon: Heart, color: "text-pink-500" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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
              Welcome back, {session?.user?.name?.split(" ")[0] || "Creator"}
            </h1>
            <p className="text-[var(--muted)]">
              Here are your personalized brand matches for today.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 card-hover"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--muted)]">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state - For You */}
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
              Add your Instagram username to unlock AI-powered brand matches tailored to your content and audience.
            </p>
            <Link href="/onboarding" className="btn btn-primary">
              <Users className="w-5 h-5" />
              Connect Instagram
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
