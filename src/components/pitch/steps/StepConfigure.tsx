"use client";

import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TemplateSelector } from "../TemplateSelector";
import { Plus, X, Sparkles, ArrowRight, FileText } from "lucide-react";
import type { ToneType, LengthType, CreatorData, BrandData } from "@/lib/ai/pitch-prompts";
import type { PitchTemplate } from "../hooks/useTemplates";

interface StepConfigureProps {
  creator: CreatorData | null;
  brand: BrandData | null;
  tone: ToneType;
  length: LengthType;
  customPoints: string[];
  onToneChange: (value: ToneType) => void;
  onLengthChange: (value: LengthType) => void;
  onAddCustomPoint: (point: string) => void;
  onRemoveCustomPoint: (index: number) => void;
  templates: PitchTemplate[];
  onSelectTemplate: (template: PitchTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onGenerate: () => void;
}

const TONES: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

const LENGTHS: { value: LengthType; label: string; words: string }[] = [
  { value: "short", label: "Short", words: "~50w" },
  { value: "medium", label: "Medium", words: "~75w" },
  { value: "long", label: "Detailed", words: "~100w" },
];

export function StepConfigure({
  creator,
  brand,
  tone,
  length,
  customPoints,
  onToneChange,
  onLengthChange,
  onAddCustomPoint,
  onRemoveCustomPoint,
  templates,
  onSelectTemplate,
  onDeleteTemplate,
  onGenerate,
}: StepConfigureProps) {
  const [newPoint, setNewPoint] = useState("");

  const handleAddPoint = () => {
    if (newPoint.trim() && newPoint.length >= 5 && customPoints.length < 5) {
      onAddCustomPoint(newPoint);
      setNewPoint("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Card - Who are you pitching? */}
      <BlurFade delay={0.05}>
        <div className="relative rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--accent-lighter)] p-5 overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.03] blur-3xl rounded-full" />

          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-4">
            Pitching To
          </p>

          <div className="flex items-center gap-4">
            {/* Creator */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-[var(--accent)]">
                    {creator?.username?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    @{creator?.username || "you"}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    {formatNumber(creator?.followers)} followers
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>

            {/* Brand */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-secondary-light)] flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-[var(--accent-secondary)]">
                    {brand?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {brand?.name || "Brand"}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    {brand?.category || brand?.niche || "Brand"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Templates Quick Access */}
      {templates.length > 0 && (
        <BlurFade delay={0.1}>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <FileText className="w-4 h-4 text-[var(--muted)] shrink-0" />
            <span className="text-sm text-[var(--muted)]">Load from template</span>
            <div className="ml-auto">
              <TemplateSelector
                templates={templates}
                onSelect={onSelectTemplate}
                onDelete={onDeleteTemplate}
              />
            </div>
          </div>
        </BlurFade>
      )}

      {/* Tone Selection */}
      <BlurFade delay={0.15}>
        <div className="space-y-3">
          <label className="text-sm font-medium text-[var(--foreground)]">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onToneChange(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  tone === value
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/25 scale-[1.02]"
                    : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--accent-light)] border border-[var(--border)] hover:border-[var(--accent)]/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* Length Selection */}
      <BlurFade delay={0.2}>
        <div className="space-y-3">
          <label className="text-sm font-medium text-[var(--foreground)]">Length</label>
          <div className="flex flex-wrap gap-2">
            {LENGTHS.map(({ value, label, words }) => (
              <button
                key={value}
                onClick={() => onLengthChange(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  length === value
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/25 scale-[1.02]"
                    : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--accent-light)] border border-[var(--border)] hover:border-[var(--accent)]/30"
                }`}
              >
                {label} <span className="opacity-60">({words})</span>
              </button>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* Custom Points */}
      <BlurFade delay={0.25}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Talking Points <span className="text-[var(--muted)] font-normal">(optional)</span>
            </label>
            <span className="text-xs text-[var(--muted)]">{customPoints.length}/5</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              placeholder="e.g., Mention my 10% engagement rate"
              onKeyDown={(e) => e.key === "Enter" && handleAddPoint()}
              disabled={customPoints.length >= 5}
              className="flex-1 h-11 rounded-xl border-[var(--border)] bg-[var(--surface)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddPoint}
              disabled={customPoints.length >= 5 || newPoint.trim().length < 5}
              className="h-11 w-11 rounded-xl border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-light)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {customPoints.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {customPoints.map((point, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="group gap-2 pr-1.5 py-1.5 pl-3 rounded-full bg-[var(--accent-light)] text-[var(--accent)] border-0 animate-in fade-in slide-in-from-bottom-1 duration-200"
                >
                  <span className="text-sm">{point}</span>
                  <button
                    onClick={() => onRemoveCustomPoint(i)}
                    className="p-1 rounded-full hover:bg-[var(--accent)]/20 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </BlurFade>

      {/* Generate Button */}
      <BlurFade delay={0.3}>
        <div className="pt-4">
          <Button
            onClick={onGenerate}
            disabled={!creator || !brand}
            className="w-full h-12 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-semibold shadow-lg shadow-[var(--accent)]/25 hover:shadow-xl hover:shadow-[var(--accent)]/30 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Pitch
          </Button>
          <p className="text-xs text-center text-[var(--muted)] mt-3">
            AI will craft a personalized pitch based on your settings
          </p>
        </div>
      </BlurFade>
    </div>
  );
}

function formatNumber(n: number | null | undefined): string {
  if (!n) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
