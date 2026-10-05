import * as React from "react";

import { cn } from "../lib/utils";

export interface PageHeaderProps extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Rendered right-aligned on desktop - primary actions live here. */
  actions?: React.ReactNode;
  /** Anything above the title: breadcrumbs, domain label, filters. */
  breadcrumb?: React.ReactNode;
  meta?: React.ReactNode;
}

/**
 * Consistent page top for every route in every application.
 */
function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  meta,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {breadcrumb ? <div className="text-muted-foreground text-sm">{breadcrumb}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
          {meta ? <div className="mt-1 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

export { PageHeader };
