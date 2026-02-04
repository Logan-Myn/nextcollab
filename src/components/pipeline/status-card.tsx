"use client";

import { LucideIcon } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function StatusCard({
  label,
  count,
  icon: Icon,
  color,
  isActive = false,
  onClick,
}: StatusCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-200 text-left w-full group",
        "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        isActive
          ? "bg-[var(--surface-elevated)] border-2 shadow-sm"
          : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)]/50"
      )}
      style={{
        borderColor: isActive ? color : undefined,
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ backgroundColor: color }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200",
            "group-hover:scale-110"
          )}
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-2xl font-bold tracking-tight" style={{ color: isActive ? color : undefined }}>
          <NumberTicker value={count} className={isActive ? "" : "text-foreground"} />
        </p>
        <p className="text-xs font-medium text-muted-foreground capitalize">
          {label}
        </p>
      </div>
    </button>
  );
}
