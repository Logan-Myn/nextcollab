"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Instagram,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cleanUsername = username.replace(/^@/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanUsername.trim() || !session?.user?.id) return;

    setError(null);
    setIsLoading(true);

    try {
      // Save minimal profile with just the username, then redirect immediately.
      // The SSE enrichment on the creator page will fetch the full profile.
      const saveRes = await fetch("/api/instagram/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          profile: { username: cleanUsername },
          forceReset: true,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save profile");

      // Redirect to creator profile page where SSE enrichment will happen
      router.push(`/creator/${encodeURIComponent(cleanUsername)}`);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
      setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-lg">
          <div className="animate-fade-up opacity-0">
            <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-8 md:p-10 shadow-xl text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-6">
                <Instagram className="w-8 h-8 text-white" />
              </div>

              <h1
                className="text-2xl md:text-3xl font-bold mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What&apos;s your Instagram?
              </h1>
              <p className="text-[var(--muted)] mb-8 max-w-sm mx-auto">
                We&apos;ll analyze your profile to find brands that match your
                style and audience.
              </p>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] text-lg">
                    @
                  </span>
                  <Input
                    type="text"
                    value={cleanUsername}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/^@/, ""))
                    }
                    placeholder="your_username"
                    className="h-14 pl-9 rounded-xl bg-[var(--surface-elevated)] text-lg"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!cleanUsername.trim() || isLoading}
                  size="lg"
                  className="w-full h-14 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Finding your profile...
                    </>
                  ) : (
                    <>
                      Find my matches
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Info */}
              <div className="mt-8 p-4 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-left text-[var(--foreground)]">
                    <strong>No login required.</strong> We analyze public data
                    to show you matching brands instantly. Connect your account
                    later for deeper insights.
                  </p>
                </div>
              </div>
            </div>

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
        </div>
      </main>
    </div>
  );
}
