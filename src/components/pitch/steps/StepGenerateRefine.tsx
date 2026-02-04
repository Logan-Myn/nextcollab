"use client";

import { useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TemplateSelector } from "../TemplateSelector";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import {
  Copy,
  Check,
  ChevronLeft,
  Send,
  Loader2,
  RotateCcw,
  Save,
  Plus,
  X,
  Sparkles,
  Wand2,
  Settings2,
} from "lucide-react";
import {
  parsePitchResponse,
  buildRefineUserPrompt,
  type CreatorData,
  type BrandData,
  type ToneType,
  type LengthType,
} from "@/lib/ai/pitch-prompts";
import type { PitchTemplate } from "../hooks/useTemplates";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  displayContent: string;
  isSuccess?: boolean;
}

interface StepGenerateRefineProps {
  subject: string;
  body: string;
  tone: ToneType;
  length: LengthType;
  customPoints: string[];
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onToneChange: (value: ToneType) => void;
  onLengthChange: (value: LengthType) => void;
  onAddCustomPoint: (point: string) => void;
  onRemoveCustomPoint: (index: number) => void;
  creator: CreatorData | null;
  brand: BrandData | null;
  isGenerating: boolean;
  onRegenerate: () => void;
  onBack: () => void;
  onMarkAsSent: () => Promise<void>;
  isMarkingAsSent: boolean;
  alreadyPitched: boolean;
  templates: PitchTemplate[];
  onSelectTemplate: (template: PitchTemplate) => void;
  onSaveTemplate: () => void;
  onDeleteTemplate: (id: string) => void;
  isSavingTemplate: boolean;
}

const TONES: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Pro" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Hype" },
];

const LENGTHS: { value: LengthType; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

const QUICK_ACTIONS = [
  "Make it shorter",
  "More professional",
  "Add my rate",
  "More enthusiastic",
];

export function StepGenerateRefine({
  subject,
  body,
  tone,
  length,
  customPoints,
  onSubjectChange,
  onBodyChange,
  onToneChange,
  onLengthChange,
  onAddCustomPoint,
  onRemoveCustomPoint,
  creator,
  brand,
  isGenerating,
  onRegenerate,
  onBack,
  onMarkAsSent,
  isMarkingAsSent,
  alreadyPitched,
  templates,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  isSavingTemplate,
}: StepGenerateRefineProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [newPoint, setNewPoint] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const confettiRef = useRef<ConfettiRef>(null);
  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/pitch/refine",
      body: {
        creator,
        brand,
      },
    }),
    onFinish: ({ message }) => {
      const textContent = message.parts
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("");

      const parsed = parsePitchResponse(textContent);
      if (parsed) {
        onSubjectChange(parsed.subject);
        onBodyChange(parsed.body);
        setDisplayMessages((prev) => [
          ...prev,
          {
            id: `msg-${++messageIdRef.current}`,
            role: "assistant",
            displayContent: "Done! I've updated your pitch.",
            isSuccess: true,
          },
        ]);
      } else {
        setDisplayMessages((prev) => [
          ...prev,
          {
            id: `msg-${++messageIdRef.current}`,
            role: "assistant",
            displayContent: textContent || "I couldn't refine the pitch. Please try again.",
          },
        ]);
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  });

  const isRefining = status === "submitted" || status === "streaming";

  const sendRefineRequest = useCallback(
    (instruction: string) => {
      setDisplayMessages((prev) => [
        ...prev,
        {
          id: `msg-${++messageIdRef.current}`,
          role: "user",
          displayContent: instruction,
        },
      ]);

      const fullPrompt = buildRefineUserPrompt(subject, body, instruction);
      sendMessage({ text: fullPrompt });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
    [subject, body, sendMessage]
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      sendRefineRequest(action);
    },
    [sendRefineRequest]
  );

  const handleChatSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      sendRefineRequest(chatInput);
      setChatInput("");
    },
    [chatInput, sendRefineRequest]
  );

  const handleCopy = useCallback(async () => {
    const fullPitch = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(fullPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [subject, body]);

  const handleMarkAsSent = useCallback(async () => {
    await onMarkAsSent();
    setShowConfetti(true);
    confettiRef.current?.fire({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [onMarkAsSent]);

  const handleAddPoint = () => {
    if (newPoint.trim() && newPoint.length >= 5 && customPoints.length < 5) {
      onAddCustomPoint(newPoint);
      setNewPoint("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Confetti Canvas */}
      {showConfetti && (
        <Confetti
          ref={confettiRef}
          className="fixed inset-0 pointer-events-none z-50"
          manualstart
        />
      )}

      {/* Header Actions */}
      <BlurFade delay={0.05}>
        <div className="flex items-center justify-between pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!subject || !body}
              className={cn(
                "gap-1.5 rounded-lg transition-all cursor-pointer",
                copied
                  ? "border-green-500/50 bg-green-500/5 text-green-600"
                  : "hover:border-[var(--accent)]/40 hover:bg-[var(--accent-light)]"
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              onClick={handleMarkAsSent}
              disabled={isMarkingAsSent || alreadyPitched || !subject || !body}
              size="sm"
              className={cn(
                "gap-1.5 rounded-lg transition-all cursor-pointer",
                "bg-[var(--accent)] text-white",
                "hover:bg-[var(--accent-dark)] hover:shadow-lg hover:shadow-[var(--accent)]/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isMarkingAsSent ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {alreadyPitched ? "Pitched" : "Mark Sent"}
            </Button>
          </div>
        </div>
      </BlurFade>

      {/* Main Content - Pitch Preview + Chat */}
      <BlurFade delay={0.1} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          {/* Accent top border */}
          <div className="h-1 w-full bg-[var(--accent)]" />

          {/* Pitch Content */}
          <div className="p-5 border-b border-[var(--border)]">
            {/* Subject */}
            <div className="mb-4">
              <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">
                Subject
              </span>
              {isGenerating && !subject ? (
                <div className="h-6 mt-1.5 rounded bg-[var(--surface-elevated)] animate-pulse" />
              ) : (
                <h3 className="mt-1 text-lg font-semibold leading-snug">
                  {subject || "..."}
                </h3>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--border)] my-4" />

            {/* Body */}
            <div>
              <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">
                Body
              </span>
              {isGenerating && !body ? (
                <div className="space-y-2 mt-1.5">
                  <div className="h-4 rounded bg-[var(--surface-elevated)] animate-pulse" />
                  <div className="h-4 rounded bg-[var(--surface-elevated)] animate-pulse w-5/6" />
                  <div className="h-4 rounded bg-[var(--surface-elevated)] animate-pulse w-4/6" />
                </div>
              ) : (
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--foreground)]/85 whitespace-pre-wrap">
                  {body || "..."}
                </p>
              )}
            </div>
          </div>

          {/* AI Chat Section */}
          <div className="flex-1 flex flex-col p-4 min-h-0">
            {/* Chat Header */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[var(--border)]">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Wand2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium">AI Refinement</span>
                <span className="text-xs text-[var(--muted)] ml-2">Powered by Claude</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pb-3">
              {displayMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center mb-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <p className="text-sm font-medium">Ready to refine</p>
                  <p className="text-xs text-[var(--muted)]">
                    Use quick actions or type a request
                  </p>
                </div>
              ) : (
                displayMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLast={index === displayMessages.length - 1}
                  />
                ))
              )}
              {isRefining && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-white animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-1.5 pb-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  disabled={isRefining}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer",
                    "border border-[var(--border)] bg-[var(--surface)]",
                    "transition-all duration-200",
                    "hover:border-[var(--accent)]/40 hover:bg-[var(--accent-light)] hover:text-[var(--accent)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleChatSubmit} className="relative">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe how to improve..."
                disabled={isRefining}
                className={cn(
                  "min-h-[70px] pr-11 resize-none text-sm",
                  "rounded-xl border-[var(--border)]",
                  "bg-[var(--surface-elevated)]",
                  "transition-all",
                  "focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20",
                  "placeholder:text-[var(--muted)]"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isRefining || !chatInput.trim()}
                className={cn(
                  "absolute bottom-2.5 right-2.5 h-7 w-7 rounded-lg cursor-pointer",
                  "bg-[var(--accent)] hover:bg-[var(--accent-dark)]",
                  "transition-all",
                  "disabled:opacity-40"
                )}
              >
                {isRefining ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </BlurFade>

      {/* Settings Footer */}
      <BlurFade delay={0.15}>
        <div className="pt-4 border-t border-[var(--border)] mt-4">
          {/* Collapsed view */}
          <div className="w-full flex items-center justify-between py-2 px-1 text-sm">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)] transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>Settings</span>
              <span className="text-xs">
                · {tone} · {length}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <TemplateSelector
                templates={templates}
                onSelect={onSelectTemplate}
                onDelete={onDeleteTemplate}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onSaveTemplate}
                disabled={isSavingTemplate || !subject || !body}
                className="h-7 px-2 text-xs hover:bg-[var(--accent-light)] cursor-pointer"
              >
                {isSavingTemplate ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                disabled={isGenerating}
                className="h-7 px-2 text-xs hover:bg-[var(--accent-light)] cursor-pointer"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* Expanded settings */}
          {showSettings && (
            <div className="pt-3 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Tone & Length */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--muted)]">Tone</label>
                  <div className="flex gap-1">
                    {TONES.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => onToneChange(value)}
                        className={cn(
                          "flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                          tone === value
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--accent-light)] border border-[var(--border)]"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--muted)]">Length</label>
                  <div className="flex gap-1">
                    {LENGTHS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => onLengthChange(value)}
                        className={cn(
                          "flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                          length === value
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--accent-light)] border border-[var(--border)]"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Talking Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--muted)]">Talking Points</label>
                  <span className="text-xs text-[var(--muted)]">{customPoints.length}/5</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newPoint}
                    onChange={(e) => setNewPoint(e.target.value)}
                    placeholder="Add a point..."
                    onKeyDown={(e) => e.key === "Enter" && handleAddPoint()}
                    disabled={customPoints.length >= 5}
                    className="flex-1 h-8 text-xs rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddPoint}
                    disabled={customPoints.length >= 5 || newPoint.trim().length < 5}
                    className="h-8 w-8 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {customPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {customPoints.map((point, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="gap-1 pr-1 py-1 pl-2 text-xs rounded-md bg-[var(--accent-light)] text-[var(--accent)] border-0"
                      >
                        {point}
                        <button
                          onClick={() => onRemoveCustomPoint(i)}
                          className="p-0.5 rounded hover:bg-[var(--accent)]/20 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  );
}

function ChatMessage({ message, isLast }: { message: DisplayMessage; isLast: boolean }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-2",
        isUser && "flex-row-reverse",
        isLast && "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
    >
      {!isUser && (
        <div className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
          message.isSuccess
            ? "bg-green-500"
            : "bg-[var(--accent)]"
        )}>
          {message.isSuccess ? (
            <Check className="w-3 h-3 text-white" />
          ) : (
            <Sparkles className="w-3 h-3 text-white" />
          )}
        </div>
      )}
      <div
        className={cn(
          "rounded-xl px-3 py-2 max-w-[85%]",
          isUser
            ? "bg-[var(--accent)] text-white ml-auto"
            : message.isSuccess
              ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
              : "bg-[var(--surface-elevated)] border border-[var(--border)]"
        )}
      >
        <p className="text-sm leading-relaxed">
          {message.displayContent}
        </p>
      </div>
    </div>
  );
}
