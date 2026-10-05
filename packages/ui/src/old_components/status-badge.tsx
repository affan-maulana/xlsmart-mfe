import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * Presentational status indicator.
 *
 * It deliberately knows nothing about domain states: each application owns the
 * mapping from its own status value to a semantic tone.
 */
const statusTones = cva("", {
  variants: {
    tone: {
      neutral: "bg-muted text-muted-foreground border-border",
      info: "bg-info/15 text-info border-info/30",
      success: "bg-success/15 text-success border-success/30",
      warning: "bg-warning/20 text-warning-foreground border-warning/40",
      danger: "bg-destructive/15 text-destructive border-destructive/30",
    },
    size: {
      sm: "px-2 py-0.5 text-[0.7rem]",
      default: "px-2.5 py-1 text-xs",
    },
  },
  defaultVariants: {
    tone: "neutral",
    size: "default",
  },
});

const dotColors = {
  neutral: "bg-muted-foreground",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
} as const;

export type StatusTone = keyof typeof dotColors;

export interface StatusBadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof statusTones> {
  tone?: StatusTone;
  label: React.ReactNode;
  /** Show a leading state dot. */
  dot?: boolean;
  /** Animate the leading dot - use for states that are actively in progress. */
  pulse?: boolean;
}

function StatusBadge({
  tone = "neutral",
  size = "default",
  label,
  dot = true,
  pulse = false,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        statusTones({ tone, size }),
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            dotColors[tone],
            pulse && "animate-pulse",
          )}
        />
      ) : null}
      <span>{label}</span>
    </span>
  );
}

export { StatusBadge, statusTones };
