"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { StepConfigure } from "./steps/StepConfigure";
import { StepGenerateRefine } from "./steps/StepGenerateRefine";
import { usePitchGeneration } from "./hooks/usePitchGeneration";
import { useTemplates, type PitchTemplate } from "./hooks/useTemplates";
import type { CreatorData, BrandData } from "@/lib/ai/pitch-prompts";
import { toast } from "sonner";

type Step = "configure" | "generate";

interface PitchWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: CreatorData | null;
  brand: BrandData | null;
  brandId: string;
  userId: string;
}

const STEPS: Step[] = ["configure", "generate"];
const STEP_TITLES: Record<Step, string> = {
  configure: "Configure Pitch",
  generate: "Your Pitch",
};
const STEP_DESCRIPTIONS: Record<Step, string> = {
  configure: "Set your preferences and talking points",
  generate: "Review, edit, and refine with AI",
};

export function PitchWizard({
  open,
  onOpenChange,
  creator,
  brand,
  brandId,
  userId,
}: PitchWizardProps) {
  const [step, setStep] = useState<Step>("configure");
  const [alreadyPitched, setAlreadyPitched] = useState(false);
  const [isMarkingAsSent, setIsMarkingAsSent] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const pitch = usePitchGeneration({ creator, brand });
  const { templates, saveTemplate, deleteTemplate, incrementUsage } = useTemplates({
    userId,
  });

  // Check if already pitched
  useEffect(() => {
    if (open && userId && brandId) {
      fetch(`/api/pitch/mark-sent?userId=${userId}&brandId=${brandId}`)
        .then((res) => res.json())
        .then((data) => setAlreadyPitched(data.pitched))
        .catch(() => {});
    }
  }, [open, userId, brandId]);

  // Reset when closing
  useEffect(() => {
    if (!open) {
      setStep("configure");
      pitch.reset();
    }
  }, [open]);

  const handleGenerate = useCallback(async () => {
    await pitch.generate();
    setStep("generate");
  }, [pitch]);

  const handleBack = useCallback(() => {
    setStep("configure");
  }, []);

  const handleSelectTemplate = useCallback(
    (template: PitchTemplate) => {
      pitch.setSubject(template.subject);
      pitch.setBody(template.body);
      if (template.tone) {
        pitch.setTone(template.tone as "professional" | "casual" | "enthusiastic");
      }
      incrementUsage(template.id);
      toast.success(`Loaded template: ${template.name}`);
      // If on configure step, auto-advance to generate step
      if (step === "configure") {
        setStep("generate");
      }
    },
    [pitch, incrementUsage, step]
  );

  const handleSaveTemplate = useCallback(async () => {
    if (!pitch.subject || !pitch.body) return;

    setIsSavingTemplate(true);
    try {
      const name = prompt("Enter a name for this template:");
      if (!name || name.length < 3 || name.length > 50) {
        if (name !== null) {
          toast.error("Template name must be 3-50 characters");
        }
        return;
      }

      await saveTemplate({
        name,
        subject: pitch.subject,
        body: pitch.body,
        tone: pitch.tone,
        category: brand?.category || undefined,
      });
      toast.success("Template saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  }, [pitch.subject, pitch.body, pitch.tone, brand?.category, saveTemplate]);

  const handleDeleteTemplate = useCallback(
    async (id: string) => {
      try {
        await deleteTemplate(id);
        toast.success("Template deleted");
      } catch {
        toast.error("Failed to delete template");
      }
    },
    [deleteTemplate]
  );

  const handleMarkAsSent = useCallback(async () => {
    setIsMarkingAsSent(true);
    try {
      const res = await fetch("/api/pitch/mark-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          brandId,
          pitchSubject: pitch.subject,
          pitchBody: pitch.body,
          pitchTone: pitch.tone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as sent");
      }

      setAlreadyPitched(true);
      toast.success("Pitch marked as sent! Good luck!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark as sent");
    } finally {
      setIsMarkingAsSent(false);
    }
  }, [userId, brandId, pitch.subject, pitch.body, pitch.tone]);

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col h-full p-0"
        showCloseButton
      >
        {/* Header */}
        <SheetHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <SheetTitle className="text-lg font-semibold">
                {STEP_TITLES[step]}
              </SheetTitle>
              <SheetDescription className="text-sm text-[var(--muted)] mt-0.5">
                {STEP_DESCRIPTIONS[step]}
              </SheetDescription>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2 pt-1">
              {STEPS.map((s, index) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      index === currentStepIndex
                        ? "bg-[var(--accent)] scale-110"
                        : index < currentStepIndex
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--border)]"
                    )}
                  />
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-6 h-0.5 rounded-full transition-all duration-300",
                        index < currentStepIndex
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--border)]"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </SheetHeader>

        {/* Content with step transitions */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="h-full px-6 py-6">
            {step === "configure" && (
              <div className="h-full animate-in fade-in slide-in-from-right-4 duration-300">
                <StepConfigure
                  creator={creator}
                  brand={brand}
                  tone={pitch.tone}
                  length={pitch.length}
                  customPoints={pitch.customPoints}
                  onToneChange={pitch.setTone}
                  onLengthChange={pitch.setLength}
                  onAddCustomPoint={pitch.addCustomPoint}
                  onRemoveCustomPoint={pitch.removeCustomPoint}
                  templates={templates}
                  onSelectTemplate={handleSelectTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onGenerate={handleGenerate}
                />
              </div>
            )}

            {step === "generate" && (
              <div className="h-full animate-in fade-in slide-in-from-right-4 duration-300">
                <StepGenerateRefine
                  subject={pitch.subject}
                  body={pitch.body}
                  tone={pitch.tone}
                  length={pitch.length}
                  customPoints={pitch.customPoints}
                  onSubjectChange={pitch.setSubject}
                  onBodyChange={pitch.setBody}
                  onToneChange={pitch.setTone}
                  onLengthChange={pitch.setLength}
                  onAddCustomPoint={pitch.addCustomPoint}
                  onRemoveCustomPoint={pitch.removeCustomPoint}
                  creator={creator}
                  brand={brand}
                  isGenerating={pitch.isGenerating}
                  onRegenerate={pitch.generate}
                  onBack={handleBack}
                  onMarkAsSent={handleMarkAsSent}
                  isMarkingAsSent={isMarkingAsSent}
                  alreadyPitched={alreadyPitched}
                  templates={templates}
                  onSelectTemplate={handleSelectTemplate}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  isSavingTemplate={isSavingTemplate}
                />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
