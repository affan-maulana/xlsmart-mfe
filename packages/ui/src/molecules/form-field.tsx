import { Label } from "../ui/label";
import { FieldError } from "../atoms/field-error";
import { cn } from "../lib/utils";
import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string | null;
  /** Control element (`Input`, `Select`, custom). Must carry the matching `id`. */
  children: ReactNode;
  className?: string;
}

/**
 * Standard form field composition: Label + control + validation message.
 * Keeps label styling and error placement consistent across every module.
 */
export function FormField({
  id,
  label,
  required,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
