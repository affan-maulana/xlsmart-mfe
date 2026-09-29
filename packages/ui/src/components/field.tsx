import * as React from "react";

import { cn } from "../lib/utils";
import { Label } from "./label";

interface FieldProps extends React.ComponentProps<"div"> {
  label: React.ReactNode;
  htmlFor?: string;
  /** Validation message. When set, the field is marked invalid for a11y. */
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
}

/**
 * Label + control + hint + error, in the layout every form in the platform uses.
 * The control is passed as children so this stays framework agnostic -
 * React Hook Form wires in through htmlFor/id.
 */
function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
  ...props
}: FieldProps) {
  const describedBy = error ? `${htmlFor}-error` : hint && htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div data-slot="field" className={cn("grid gap-1.5", className)} {...props}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden className="text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            "aria-invalid": error ? true : undefined,
            "aria-describedby": describedBy,
            id: htmlFor,
          })
        : children}
      {hint && !error ? (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
          className="text-destructive text-xs font-medium"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Field };
