"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles, Check, Wand2 } from "lucide-react";

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  displayContent: string;
  isSuccess?: boolean;
}

interface PitchChatProps {
  messages: DisplayMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  quickActions?: string[];
  onQuickAction?: (action: string) => void;
}

export function PitchChat({
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  quickActions = [
    "Make it shorter",
    "More professional",
    "Add my rate",
    "More enthusiastic",
  ],
  onQuickAction,
}: PitchChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-[var(--border)]">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#ff8c7a] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--surface)]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">AI Refinement</h3>
          <p className="text-xs text-[var(--muted)]">Powered by Claude</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-[#ff8c7a]/10 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-[var(--accent)]/60" />
            </div>
            <p className="text-sm font-medium mb-1">Ready to refine</p>
            <p className="text-xs text-[var(--muted)] max-w-[200px]">
              Use the quick actions or describe how you&apos;d like to improve your pitch
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#ff8c7a] flex items-center justify-center shrink-0 shadow-md shadow-[var(--accent)]/20">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="flex-1 pt-1.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-[var(--muted)]">Refining...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-5">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => onQuickAction?.(action)}
              disabled={isLoading}
              className={cn(
                "group relative px-4 py-2.5 text-sm font-medium rounded-xl",
                "border border-[var(--border)] bg-[var(--surface)]",
                "transition-all duration-300 ease-out",
                "hover:border-[var(--accent)]/40 hover:bg-gradient-to-r hover:from-[var(--accent)]/5 hover:to-[#ff8c7a]/5",
                "hover:shadow-md hover:shadow-[var(--accent)]/10 hover:-translate-y-0.5",
                "active:translate-y-0 active:shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              )}
            >
              <span className="relative z-10 bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)] group-hover:from-[var(--accent)] group-hover:to-[#ff8c7a] bg-clip-text group-hover:text-transparent transition-all duration-300">
                {action}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={onSubmit} className="relative">
        <div className="relative group">
          <Textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Describe how to improve your pitch..."
            disabled={isLoading}
            className={cn(
              "min-h-[100px] pr-14 resize-none",
              "rounded-xl border-2 border-[var(--border)]",
              "bg-[var(--surface-elevated)]/50",
              "transition-all duration-300",
              "focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/10",
              "placeholder:text-[var(--muted)]"
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "absolute bottom-3 right-3 rounded-xl",
              "bg-gradient-to-r from-[var(--accent)] to-[#ff8c7a]",
              "hover:opacity-90 hover:shadow-lg hover:shadow-[var(--accent)]/30",
              "transition-all duration-300",
              "disabled:opacity-40 disabled:hover:shadow-none"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

function ChatMessage({ message, isLast }: { message: DisplayMessage; isLast: boolean }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser && "flex-row-reverse",
        isLast && "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
    >
      {!isUser && (
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md",
          message.isSuccess
            ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/20"
            : "bg-gradient-to-br from-[var(--accent)] to-[#ff8c7a] shadow-[var(--accent)]/20"
        )}>
          {message.isSuccess ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%]",
          "transition-all duration-200",
          isUser
            ? "bg-gradient-to-r from-[var(--accent)] to-[#ff8c7a] text-white ml-auto shadow-lg shadow-[var(--accent)]/20"
            : message.isSuccess
              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
              : "bg-[var(--surface-elevated)] border border-[var(--border)]"
        )}
      >
        <p className={cn(
          "text-sm leading-relaxed",
          message.isSuccess && !isUser && "text-green-600 dark:text-green-400 font-medium"
        )}>
          {message.displayContent}
        </p>
      </div>
    </div>
  );
}
