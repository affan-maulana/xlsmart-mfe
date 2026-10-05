import { ChevronLeft } from "lucide-react";
import { cn } from "../lib/utils";

interface BreadcrumbProps {
  /** Trail from root to current, e.g. ['Home', 'Prepaid to Postpaid']. */
  trail: string[];
  className?: string;
}

/** Navigation trail with a back affordance. The last crumb is the current page. */
export function Breadcrumb({ trail, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      <ChevronLeft className="size-icon" aria-hidden />
      <ol className="flex items-center gap-2">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={item} className="flex items-center gap-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-foreground"
                >
                  {item}
                </span>
              ) : (
                <span className="text-ink-soft/80">{item}</span>
              )}
              {!isLast && (
                <span className="text-ink-muted" aria-hidden>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
