import { cn } from "@repo/ui";

/**
 * Key-value display block. Used in summary sections (e.g. plan summary,
 * customer info). App-level because multiple features use it.
 */
interface InfoBlockProps {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
  className?: string;
}

export function InfoBlock({ label, value, hint, valueClassName, className }: InfoBlockProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold text-foreground", valueClassName)}>
        {value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
