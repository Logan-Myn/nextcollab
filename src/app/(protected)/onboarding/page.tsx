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
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberTicker } from "@/components/ui/number-ticker";

interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  profilePicture: string;
  isVerified: boolean;
  engagementRate: number | null;
  niche: string | null;
  recentHashtags: string[];
}

type Step = "username" | "analyzing" | "results";

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cleanUsername = username.replace(/^@/, "");

  const handleFetchProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanUsername.trim()) return;

    setError(null);
    setStep("analyzing");

    try {
      const res = await fetch(
        `/api/instagram/profile?username=${encodeURIComponent(cleanUsername)}`
      );

      if (res.status === 404) {
        setError(
          `We couldn't find @${cleanUsername} on Instagram. Check the spelling and try again.`
        );
        setStep("username");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const json = await res.json();
      setProfile(json.data);
      setStep("results");
    } catch {
      setError(
        "Something went wrong while analyzing your profile. Please try again."
      );
      setStep("username");
    }
  };

  const handleSaveAndContinue = async () => {
    if (!profile || !session?.user?.id) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/instagram/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          profile,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      router.push("/dashboard");
    } catch {
      setError("Failed to save your profile. Please try again.");
      setIsSaving(false);
    }
  };

  const stepIndex = step === "username" ? 0 : step === "analyzing" ? 1 : 2;

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
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8 animate-fade-up opacity-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i <= stepIndex
                      ? "bg-[var(--accent)] scale-110"
                      : "bg-[var(--border)]"
                  }`}
                />
                {i < 2 && (
                  <div
                    className={`w-8 h-0.5 transition-all duration-300 ${
                      i < stepIndex ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Username Input */}
          {step === "username" && (
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
                <form onSubmit={handleFetchProfile} className="space-y-4">
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
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!cleanUsername.trim()}
                    size="lg"
                    className="w-full h-14 text-base"
                  >
                    Find my matches
                    <ArrowRight className="w-5 h-5" />
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
          )}

          {/* Step 2: Analyzing */}
          {step === "analyzing" && (
            <div className="animate-fade-up opacity-0">
              <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-8 md:p-10 shadow-xl text-center">
                {/* Animated avatar placeholder */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 animate-spin-slow" />
                  <div className="absolute inset-[3px] rounded-full bg-[var(--surface)] flex items-center justify-center">
                    <span
                      className="text-2xl font-bold text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      @
                    </span>
                  </div>
                </div>

                <h1
                  className="text-2xl md:text-3xl font-bold mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Analyzing @{cleanUsername}
                </h1>
                <p className="text-[var(--muted)] mb-10 max-w-sm mx-auto">
                  We&apos;re scanning your profile, posts and audience to find
                  the best brand matches.
                </p>

                {/* Loading steps */}
                <div className="space-y-4 text-left max-w-xs mx-auto">
                  {[
                    { label: "Fetching profile data", delay: "0ms" },
                    { label: "Analyzing content & niche", delay: "800ms" },
                    { label: "Calculating engagement", delay: "1600ms" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-fade-up opacity-0"
                      style={{ animationDelay: item.delay }}
                    >
                      <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin flex-shrink-0" />
                      <span className="text-sm text-[var(--muted)]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && profile && (
            <div className="animate-fade-up opacity-0">
              <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-8 md:p-10 shadow-xl">
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-6">
                  {profile.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profilePicture}
                      alt={profile.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-xl font-bold">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2
                      className="text-xl font-bold flex items-center gap-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {profile.fullName}
                      {profile.isVerified && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      )}
                    </h2>
                    <p className="text-[var(--muted)]">@{profile.username}</p>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-[var(--foreground)] mb-6 leading-relaxed whitespace-pre-line">
                    {profile.bio
                      .replace(/\\n/g, "\n")
                      .replace(/\\u[\dA-Fa-f]{4}/g, (match) =>
                        String.fromCodePoint(
                          parseInt(match.replace("\\u", ""), 16)
                        )
                      )}
                  </p>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[var(--surface-elevated)] rounded-xl p-4 text-center">
                    <div
                      className="text-xl font-bold text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <NumberTicker value={profile.followers} className="text-[var(--foreground)]" />
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-1">
                      Followers
                    </div>
                  </div>
                  <div className="bg-[var(--surface-elevated)] rounded-xl p-4 text-center">
                    <div
                      className="text-xl font-bold text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <NumberTicker value={profile.following} className="text-[var(--foreground)]" />
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-1">
                      Following
                    </div>
                  </div>
                  <div className="bg-[var(--surface-elevated)] rounded-xl p-4 text-center">
                    <div
                      className="text-xl font-bold text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <NumberTicker value={profile.postsCount} className="text-[var(--foreground)]" />
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-1">
                      Posts
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="space-y-3 mb-8">
                  {profile.engagementRate !== null && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)]">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Engagement Rate</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {profile.engagementRate}%
                      </span>
                    </div>
                  )}
                  {profile.niche && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)]">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                        <span className="text-sm">Detected Niche</span>
                      </div>
                      <span className="text-sm font-semibold capitalize">
                        {profile.niche}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)]">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Creator Tier</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {profile.followers >= 1000000
                        ? "Mega"
                        : profile.followers >= 100000
                          ? "Macro"
                          : profile.followers >= 10000
                            ? "Mid-tier"
                            : profile.followers >= 1000
                              ? "Micro"
                              : "Nano"}
                    </span>
                  </div>
                </div>

                {/* Hashtags */}
                {profile.recentHashtags.length > 0 && (
                  <div className="mb-8">
                    <p className="text-xs text-[var(--muted)] mb-2 uppercase tracking-wider font-medium">
                      Top Hashtags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.recentHashtags.slice(0, 8).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface-elevated)] text-[var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSaveAndContinue}
                    disabled={isSaving}
                    size="lg"
                    className="w-full h-14 text-base"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving profile...
                      </>
                    ) : (
                      <>
                        Continue to dashboard
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("username");
                      setProfile(null);
                      setError(null);
                    }}
                    className="w-full h-11 text-sm"
                  >
                    Try a different username
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
