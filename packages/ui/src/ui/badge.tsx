import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border border-border",
        outline: "border border-border text-foreground",
        info: "bg-info-subtle text-info",
        success: "bg-success-subtle text-success",
        warning: "bg-warning-subtle text-warning",
        destructive: "bg-destructive-subtle text-destructive",
      },
      size: {
        sm: "px-2 py-0 text-2xs gap-1",
        md: "px-2.5 py-0.5 text-xs gap-1.5",
        lg: "px-3 py-1.5 text-sm gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
