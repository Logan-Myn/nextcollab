"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  MessageSquare,
  CheckCircle,
  Trophy,
  XCircle,
  Ghost,
  MoreHorizontal,
  ChevronDown,
  ExternalLink,
  FileText,
  Trash2,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import { OutreachRecord, OutreachStatus } from "@/hooks/use-outreach";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  OutreachStatus,
  { label: string; color: string; icon: typeof Send; variant: "default" | "success" | "warning" | "error" | "muted" }
> = {
  pitched: {
    label: "Pitched",
    color: "var(--accent-secondary)",
    icon: Send,
    variant: "default",
  },
  negotiating: {
    label: "Negotiating",
    color: "var(--warning)",
    icon: MessageSquare,
    variant: "warning",
  },
  confirmed: {
    label: "Confirmed",
    color: "var(--success)",
    icon: CheckCircle,
    variant: "success",
  },
  completed: {
    label: "Completed",
    color: "var(--success)",
    icon: Trophy,
    variant: "success",
  },
  rejected: {
    label: "Rejected",
    color: "var(--error)",
    icon: XCircle,
    variant: "error",
  },
  ghosted: {
    label: "Ghosted",
    color: "var(--muted)",
    icon: Ghost,
    variant: "muted",
  },
};

interface OutreachCardProps {
  record: OutreachRecord;
  onStatusChange: (id: string, status: OutreachStatus) => Promise<void>;
  onNotesChange: (id: string, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating: boolean;
  index?: number;
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function OutreachCard({
  record,
  onStatusChange,
  onNotesChange,
  onDelete,
  isUpdating,
  index = 0,
}: OutreachCardProps) {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [notesValue, setNotesValue] = useState(record.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const status = record.status as OutreachStatus;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pitched;
  const StatusIcon = config.icon;

  // Update local notes when record changes
  useEffect(() => {
    setNotesValue(record.notes || "");
  }, [record.notes]);

  // Auto-save notes with debounce
  const handleNotesChange = (value: string) => {
    setNotesValue(value);

    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }

    notesTimeoutRef.current = setTimeout(async () => {
      if (value !== record.notes) {
        setIsSavingNotes(true);
        try {
          await onNotesChange(record.id, value);
        } finally {
          setIsSavingNotes(false);
        }
      }
    }, 1000);
  };

  const handleStatusSelect = async (newStatus: OutreachStatus) => {
    if (newStatus !== status) {
      await onStatusChange(record.id, newStatus);
    }
  };

  return (
    <Card
      className="overflow-hidden animate-fade-up opacity-0"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          {/* Brand Avatar */}
          <Link
            href={`/brand/${record.brand.instagramUsername || record.brand.id}`}
            className="shrink-0"
          >
            {record.brand.profilePicture ? (
              <Image
                src={record.brand.profilePicture}
                alt={record.brand.name}
                width={48}
                height={48}
                unoptimized
                className="w-12 h-12 rounded-xl object-cover hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">
                  {record.brand.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </Link>

          {/* Brand Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/brand/${record.brand.instagramUsername || record.brand.id}`}
              className="group"
            >
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {record.brand.name}
              </h3>
            </Link>
            {record.brand.instagramUsername && (
              <p className="text-sm text-muted-foreground truncate">
                @{record.brand.instagramUsername}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Pitched {formatTimeAgo(record.pitchedAt)}</span>
            </div>
          </div>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
                className={cn(
                  "gap-1.5 min-w-[120px] justify-between",
                  isUpdating && "opacity-50"
                )}
              >
                {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <StatusIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
                )}
                <span className="flex-1 text-left">{config.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {(Object.keys(STATUS_CONFIG) as OutreachStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const Icon = cfg.icon;
                return (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => handleStatusSelect(s)}
                    className={cn("gap-2", status === s && "bg-accent")}
                  >
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    {cfg.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsNotesExpanded(!isNotesExpanded)}>
                <FileText className="w-4 h-4" />
                {isNotesExpanded ? "Hide Notes" : "View Notes"}
              </DropdownMenuItem>
              {record.brand.instagramUsername && (
                <DropdownMenuItem asChild>
                  <a
                    href={`https://instagram.com/${record.brand.instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Instagram
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(record.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Amount Badge (if confirmed/completed) */}
        {record.amount && (status === "confirmed" || status === "completed") && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="success" className="gap-1">
              <DollarSign className="w-3 h-3" />
              {parseFloat(record.amount).toLocaleString()}
            </Badge>
            {record.confirmedAt && (
              <span className="text-xs text-muted-foreground">
                Confirmed {formatTimeAgo(record.confirmedAt)}
              </span>
            )}
          </div>
        )}

        {/* Expandable Notes Section */}
        {isNotesExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">
                Notes
              </label>
              {isSavingNotes && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            <textarea
              value={notesValue}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes about this outreach..."
              className="w-full min-h-[80px] p-3 bg-secondary rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        )}

        {/* Pitch Preview (collapsed) */}
        {record.pitchSubject && !isNotesExpanded && (
          <button
            onClick={() => setIsNotesExpanded(true)}
            className="mt-3 w-full text-left p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Pitch Subject
            </p>
            <p className="text-sm text-foreground truncate">{record.pitchSubject}</p>
          </button>
        )}
      </div>
    </Card>
  );
}
