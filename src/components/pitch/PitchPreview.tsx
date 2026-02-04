"use client";

import { cn } from "@/lib/utils";

interface PitchPreviewProps {
  subject: string;
  body: string;
  isLoading?: boolean;
  showShineBorder?: boolean;
  className?: string;
}

export function PitchPreview({
  subject,
  body,
  isLoading,
  showShineBorder,
  className,
}: PitchPreviewProps) {
  const isEmpty = !subject && !body;

  if (isEmpty && !isLoading) {
    return (
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed border-[var(--border)] p-8 text-center",
          "bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)]/30",
          className
        )}
      >
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[var(--accent)]/10 to-[#ff8c7a]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--accent)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Your pitch will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        showShineBorder && "p-[2px] bg-gradient-to-br from-[var(--accent)] via-[#ff8c7a] to-[var(--accent)]",
        className
      )}
    >
      {/* Animated gradient border */}
      {showShineBorder && (
        <div
          className="absolute inset-0 rounded-2xl opacity-60"
          style={{
            background: "linear-gradient(90deg, var(--accent), #ff8c7a, #ffd4cc, #ff8c7a, var(--accent))",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
      )}

      <div className={cn(
        "relative rounded-2xl bg-[var(--surface)] p-6",
        showShineBorder && "rounded-[14px]"
      )}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/[0.02] to-transparent pointer-events-none" />

        <div className="relative space-y-5">
          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#ff8c7a]" />
              <span className="text-[11px] font-semibold tracking-widest text-[var(--muted)] uppercase">
                Subject
              </span>
            </div>
            {isLoading && !subject ? (
              <div className="h-7 rounded-lg bg-gradient-to-r from-[var(--surface-elevated)] via-[var(--surface)] to-[var(--surface-elevated)] animate-pulse" />
            ) : (
              <h3 className="text-lg font-semibold leading-snug tracking-tight">
                {subject || "..."}
              </h3>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#ff8c7a] to-[var(--accent)]" />
              <span className="text-[11px] font-semibold tracking-widest text-[var(--muted)] uppercase">
                Body
              </span>
            </div>
            {isLoading && !body ? (
              <div className="space-y-2.5">
                <div className="h-4 rounded bg-gradient-to-r from-[var(--surface-elevated)] via-[var(--surface)] to-[var(--surface-elevated)] animate-pulse" />
                <div className="h-4 rounded bg-gradient-to-r from-[var(--surface-elevated)] via-[var(--surface)] to-[var(--surface-elevated)] animate-pulse w-5/6" />
                <div className="h-4 rounded bg-gradient-to-r from-[var(--surface-elevated)] via-[var(--surface)] to-[var(--surface-elevated)] animate-pulse w-4/6" />
              </div>
            ) : (
              <p className="text-[15px] leading-relaxed text-[var(--foreground)]/85 whitespace-pre-wrap">
                {body || "..."}
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
