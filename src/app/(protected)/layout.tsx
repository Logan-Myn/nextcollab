"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--muted)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
