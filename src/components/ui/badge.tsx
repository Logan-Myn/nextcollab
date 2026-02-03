import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border border-transparent px-2.5 py-0.5 text-[0.6875rem] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden capitalize",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent-light)] text-primary [a&]:hover:bg-primary/20",
        secondary:
          "bg-[var(--accent-secondary-light)] text-[var(--accent-secondary)] [a&]:hover:bg-[var(--accent-secondary-light)]",
        destructive:
          "bg-[var(--error-light)] text-destructive [a&]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        success:
          "bg-[var(--success-light)] text-[var(--success)] [a&]:hover:bg-[var(--success-light)]",
        warning:
          "bg-[var(--warning-light)] text-[var(--warning)] [a&]:hover:bg-[var(--warning-light)]",
        muted:
          "bg-surface-elevated text-muted-foreground [a&]:hover:bg-surface-elevated",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
