import * as React from "react";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "../lib/utils";

export interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  /** Ordered list of labels. Each item can be a string or { label, href }. */
  trail: Array<string | { label: string; href: string }>;
  /** Rendered before the trail — typically a back chevron link. */
  leading?: React.ReactNode;
}

/**
 * Navigation trail. Kept generic: no domain knowledge, no route assumptions.
 * The caller decides whether items are clickable links or plain labels.
 */
function Breadcrumb({ trail, leading, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)} {...props}>
      {leading}
      <ol className="flex items-center gap-1.5">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          const label = typeof item === "string" ? item : item.label;
          const href = typeof item === "object" ? item.href : undefined;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRightIcon className="text-muted-foreground size-3.5" aria-hidden />}
              {href && !isLast ? (
                <a
                  href={href}
                  className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                >
                  {label}
                </a>
              ) : (
                <span className={cn("text-foreground", isLast && "font-medium")}>{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb };
