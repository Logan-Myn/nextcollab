"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Instagram, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    // TODO: Call Xpoz API to fetch profile
    // For now, just simulate loading
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const cleanUsername = username.replace(/^@/, "");

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--accent)] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.02] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
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

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted)]">
            {session?.user?.name}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center text-white text-xs font-medium">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16 min-h-[calc(100vh-88px)]">
        <div className="w-full max-w-lg animate-fade-up opacity-0">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
            <div className="w-8 h-0.5 bg-[var(--border)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
            <div className="w-8 h-0.5 bg-[var(--border)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
          </div>

          {/* Card */}
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-8 md:p-10 shadow-xl text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-6">
              <Instagram className="w-8 h-8 text-white" />
            </div>

            {/* Header */}
            <h1
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What&apos;s your Instagram?
            </h1>
            <p className="text-[var(--muted)] mb-8 max-w-sm mx-auto">
              We&apos;ll analyze your profile to find brands that match your style and audience.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] text-lg">
                  @
                </span>
                <input
                  type="text"
                  value={cleanUsername}
                  onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                  placeholder="your_username"
                  className="w-full pl-9 pr-4 py-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] text-lg placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!cleanUsername.trim() || isLoading}
                className="w-full btn btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing profile...
                  </>
                ) : (
                  <>
                    Find my matches
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-8 p-4 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-left text-[var(--foreground)]">
                  <strong>No login required.</strong> We analyze public data to show you matching brands instantly. Connect your account later for deeper insights.
                </p>
              </div>
            </div>
          </div>

          {/* Skip for now */}
          <p className="text-center text-sm text-[var(--muted)] mt-6">
            Want to explore first?{" "}
            <Link
              href="/dashboard"
              className="text-[var(--accent)] hover:underline"
            >
              Skip for now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
