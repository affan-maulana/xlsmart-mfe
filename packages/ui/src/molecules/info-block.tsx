import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface InfoBlockProps {
  label: string;
  value: ReactNode;
  /** Optional quiet line under the value, e.g. an email under a MSISDN. */
  hint?: ReactNode;
  /** Optional icon rendered inline before the value. */
  icon?: ReactNode;
  /** Stacks label/value at small widths and aligns them in a row when `inline`. */
  className?: string;
  valueClassName?: string;
}

/**
 * Label + value data display used by the queue strip, plan summaries and
 * detail panels. Pure presentational molecule — no state, no domain logic.
 */
export function InfoBlock({
  label,
  value,
  hint,
  icon,
  className,
  valueClassName,
}: InfoBlockProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "flex items-center gap-1.5 text-base font-bold text-foreground",
          valueClassName,
        )}
      >
        {icon}
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
