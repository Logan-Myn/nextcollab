"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BlurFade } from "@/components/ui/blur-fade";
import { useTheme } from "@/components/theme-provider";
import {
  Shield,
  Palette,
  Bell,
  Loader2,
  Trash2,
  Monitor,
  Sun,
  Moon,
  Check,
  Sparkles,
  Mail,
  MessageSquare,
  Megaphone,
} from "lucide-react";

// ============================================
// Types
// ============================================

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

interface NotificationPrefs {
  emailDigest: string;
  matchAlerts: boolean;
  outreachReminders: boolean;
  productUpdates: boolean;
}

type SettingsTab = "account" | "notifications" | "appearance";

// ============================================
// Settings Page
// ============================================

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Profile state (for DashboardShell)
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Account state
  const [deleting, setDeleting] = useState(false);

  // Notification state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    emailDigest: "weekly",
    matchAlerts: true,
    outreachReminders: true,
    productUpdates: true,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  // ============================================
  // Data fetching
  // ============================================

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

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    setNotifLoading(true);
    try {
      const res = await fetch(
        `/api/settings/notifications?userId=${encodeURIComponent(session.user.id)}`
      );
      if (res.ok) {
        const json = await res.json();
        setNotifPrefs(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
    } finally {
      setNotifLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user, fetchProfile]);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab, fetchNotifications]);

  // ============================================
  // Actions
  // ============================================

  const handleResync = async () => {
    if (!profile?.instagramUsername || !session?.user?.id) return;
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
      console.error("Failed to resync:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      if (res.ok) {
        await signOut();
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setDeleting(false);
    }
  };

  const updateNotifPref = async (key: keyof NotificationPrefs, value: boolean | string) => {
    if (!session?.user?.id) return;

    // Optimistic update
    setNotifPrefs((prev) => ({ ...prev, [key]: value }));
    setNotifSaving(true);

    try {
      await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, [key]: value }),
      });
    } catch (error) {
      console.error("Failed to update notification setting:", error);
      // Revert on error
      fetchNotifications();
    } finally {
      setNotifSaving(false);
    }
  };

  // ============================================
  // Tab config
  // ============================================

  const tabs: { id: SettingsTab; label: string; icon: typeof Shield }[] = [
    { id: "account", label: "Account", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  // ============================================
  // Render
  // ============================================

  return (
    <DashboardShell
      profile={profile}
      profileLoading={profileLoading}
      onResync={handleResync}
    >
      <BlurFade delay={0.05}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage your account and preferences
          </p>
        </div>
      </BlurFade>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <BlurFade delay={0.1}>
          <nav className="lg:w-56 shrink-0">
            {/* Desktop: vertical list */}
            <div className="hidden lg:flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-[var(--accent-light)] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </BlurFade>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* ======================== ACCOUNT TAB ======================== */}
          {activeTab === "account" && (
            <BlurFade delay={0.15}>
              <div className="space-y-6">
                {/* Email info */}
                <Card className="p-6">
                  <h2 className="text-base font-semibold mb-4">Email Address</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{session?.user?.email}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {session?.user?.emailVerified
                          ? "Verified"
                          : "Not verified"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 border-red-200 dark:border-red-900/50">
                  <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">
                    Danger Zone
                  </h2>
                  <p className="text-xs text-[var(--muted)] mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account, profile, saved brands,
                          matches, outreach history, and all associated data. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Yes, delete my account"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              </div>
            </BlurFade>
          )}

          {/* ======================== NOTIFICATIONS TAB ======================== */}
          {activeTab === "notifications" && (
            <BlurFade delay={0.15}>
              <div className="space-y-6">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Email Digest */}
                    <Card className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base font-semibold">Email Digest</h2>
                          <p className="text-xs text-[var(--muted)] mt-0.5 mb-3">
                            Summary of new matches, pipeline updates, and opportunities.
                          </p>
                          <Select
                            value={notifPrefs.emailDigest}
                            onValueChange={(val) => updateNotifPref("emailDigest", val)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="off">Off</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>

                    {/* Toggle notifications */}
                    <Card className="p-6">
                      <h2 className="text-base font-semibold mb-5">Email Alerts</h2>
                      <div className="space-y-5">
                        {/* Match Alerts */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <Label htmlFor="match-alerts" className="text-sm font-medium cursor-pointer">
                                New brand matches
                              </Label>
                              <p className="text-xs text-[var(--muted)] mt-0.5">
                                Get notified when we find new brands that fit your profile.
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="match-alerts"
                            checked={notifPrefs.matchAlerts}
                            onCheckedChange={(val) => updateNotifPref("matchAlerts", val)}
                          />
                        </div>

                        {/* Outreach Reminders */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center shrink-0 mt-0.5">
                              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <Label htmlFor="outreach-reminders" className="text-sm font-medium cursor-pointer">
                                Outreach reminders
                              </Label>
                              <p className="text-xs text-[var(--muted)] mt-0.5">
                                Follow-up nudges when pitches go unanswered.
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="outreach-reminders"
                            checked={notifPrefs.outreachReminders}
                            onCheckedChange={(val) => updateNotifPref("outreachReminders", val)}
                          />
                        </div>

                        {/* Product Updates */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <Label htmlFor="product-updates" className="text-sm font-medium cursor-pointer">
                                Product updates
                              </Label>
                              <p className="text-xs text-[var(--muted)] mt-0.5">
                                New features, improvements, and changelog.
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="product-updates"
                            checked={notifPrefs.productUpdates}
                            onCheckedChange={(val) => updateNotifPref("productUpdates", val)}
                          />
                        </div>
                      </div>

                      {notifSaving && (
                        <p className="text-xs text-[var(--muted)] mt-4 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving...
                        </p>
                      )}
                    </Card>
                  </>
                )}
              </div>
            </BlurFade>
          )}

          {/* ======================== APPEARANCE TAB ======================== */}
          {activeTab === "appearance" && (
            <BlurFade delay={0.15}>
              <Card className="p-6">
                <h2 className="text-base font-semibold mb-2">Theme</h2>
                <p className="text-xs text-[var(--muted)] mb-5">
                  Choose how NextCollab looks for you.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light theme card */}
                  <button
                    onClick={() => setTheme("light")}
                    className={`group relative rounded-xl border-2 p-1 transition-all ${
                      theme === "light"
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent-light)]"
                        : "border-[var(--border)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <div className="rounded-lg overflow-hidden bg-white border border-gray-100">
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-purple-500" />
                          <div className="h-2 w-16 rounded bg-gray-200" />
                        </div>
                        <div className="h-2 w-full rounded bg-gray-100" />
                        <div className="h-2 w-3/4 rounded bg-gray-100" />
                        <div className="flex gap-2 pt-1">
                          <div className="h-6 w-14 rounded bg-purple-100" />
                          <div className="h-6 w-14 rounded bg-gray-100" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2.5">
                      <Sun className="w-4 h-4" />
                      <span className="text-sm font-medium">Light</span>
                      {theme === "light" && (
                        <Check className="w-4 h-4 text-[var(--accent)]" />
                      )}
                    </div>
                  </button>

                  {/* Dark theme card */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={`group relative rounded-xl border-2 p-1 transition-all ${
                      theme === "dark"
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent-light)]"
                        : "border-[var(--border)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <div className="rounded-lg overflow-hidden bg-[#0a0a0f] border border-gray-800">
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-purple-400" />
                          <div className="h-2 w-16 rounded bg-gray-700" />
                        </div>
                        <div className="h-2 w-full rounded bg-gray-800" />
                        <div className="h-2 w-3/4 rounded bg-gray-800" />
                        <div className="flex gap-2 pt-1">
                          <div className="h-6 w-14 rounded bg-purple-950" />
                          <div className="h-6 w-14 rounded bg-gray-800" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2.5">
                      <Moon className="w-4 h-4" />
                      <span className="text-sm font-medium">Dark</span>
                      {theme === "dark" && (
                        <Check className="w-4 h-4 text-[var(--accent)]" />
                      )}
                    </div>
                  </button>

                  {/* System theme card */}
                  <button
                    onClick={() => setTheme("system")}
                    className={`group relative rounded-xl border-2 p-1 transition-all ${
                      theme === "system"
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent-light)]"
                        : "border-[var(--border)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className="flex">
                        <div className="flex-1 bg-white p-2 space-y-1.5">
                          <div className="w-5 h-5 rounded bg-purple-500" />
                          <div className="h-1.5 w-full rounded bg-gray-100" />
                          <div className="h-1.5 w-3/4 rounded bg-gray-100" />
                          <div className="h-4 w-10 rounded bg-purple-100 mt-1" />
                        </div>
                        <div className="flex-1 bg-[#0a0a0f] p-2 space-y-1.5">
                          <div className="w-5 h-5 rounded bg-purple-400" />
                          <div className="h-1.5 w-full rounded bg-gray-800" />
                          <div className="h-1.5 w-3/4 rounded bg-gray-800" />
                          <div className="h-4 w-10 rounded bg-purple-950 mt-1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2.5">
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm font-medium">System</span>
                      {theme === "system" && (
                        <Check className="w-4 h-4 text-[var(--accent)]" />
                      )}
                    </div>
                  </button>
                </div>
              </Card>
            </BlurFade>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
