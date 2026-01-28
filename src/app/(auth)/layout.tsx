"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--accent)] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.02] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            NextCollab
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12 min-h-[calc(100vh-88px)]">
        {children}
      </main>
    </div>
  );
}
