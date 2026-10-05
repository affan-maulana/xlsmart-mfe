import { cn } from "../lib/utils";

/** Single-line validation message for a form field. */
export function FieldError({
  message,
  className,
}: {
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("mt-1 text-xs text-destructive", className)}>
      {message}
    </p>
  );
}
