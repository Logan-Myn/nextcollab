"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Heart, Trash2 } from "lucide-react";
import type { PitchTemplate } from "./hooks/useTemplates";

interface TemplateSelectorProps {
  templates: PitchTemplate[];
  onSelect: (template: PitchTemplate) => void;
  onDelete?: (templateId: string) => void;
  isLoading?: boolean;
}

export function TemplateSelector({
  templates,
  onSelect,
  onDelete,
  isLoading,
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  const favoriteTemplates = templates.filter((t) => t.isFavorite);
  const otherTemplates = templates.filter((t) => !t.isFavorite);

  if (templates.length === 0) {
    return (
      <Button variant="ghost" size="sm" disabled className="opacity-50">
        <FileText className="w-4 h-4 mr-2" />
        No Templates
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <FileText className="w-4 h-4 mr-2" />
          Templates
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {favoriteTemplates.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2 text-xs">
              <Heart className="w-3 h-3" />
              Favorites
            </DropdownMenuLabel>
            {favoriteTemplates.map((template) => (
              <TemplateItem
                key={template.id}
                template={template}
                onSelect={() => {
                  onSelect(template);
                  setOpen(false);
                }}
                onDelete={onDelete}
              />
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        {otherTemplates.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs">
              All Templates
            </DropdownMenuLabel>
            {otherTemplates.map((template) => (
              <TemplateItem
                key={template.id}
                template={template}
                onSelect={() => {
                  onSelect(template);
                  setOpen(false);
                }}
                onDelete={onDelete}
              />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TemplateItem({
  template,
  onSelect,
  onDelete,
}: {
  template: PitchTemplate;
  onSelect: () => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <DropdownMenuItem
      className="flex items-center justify-between cursor-pointer group"
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{template.name}</p>
        <p className="text-xs text-[var(--muted)] truncate">{template.subject}</p>
      </div>
      {onDelete && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onDelete(template.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--surface-elevated)] rounded transition-opacity cursor-pointer"
        >
          <Trash2 className="w-3 h-3 text-[var(--muted)]" />
        </span>
      )}
    </DropdownMenuItem>
  );
}
