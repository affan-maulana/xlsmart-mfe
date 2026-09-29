"use client";

import Link from "next/link";

import { cn } from "@repo/ui";

import type { NavigationItem } from "@/lib/config";

interface DomainQuickLinksProps {
  items: ReadonlyArray<NavigationItem>;
  className?: string;
  /** Rendered only when the hamburger menu is open on small screens. */
  mobileOpen?: boolean;
}

/**
 * Compact domain switcher for narrow viewports, where the sidebar is hidden.
 */
export function DomainQuickLinks({ items, className, mobileOpen = false }: DomainQuickLinksProps) {
  if (!mobileOpen) return null;

  return (
    <nav
      aria-label="Domains"
      className={cn(
        "absolute top-14 left-0 z-40 w-full border-b bg-sidebar p-3 shadow-md md:hidden",
        className,
      )}
    >
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground block rounded-md px-3 py-2 text-sm font-medium"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
