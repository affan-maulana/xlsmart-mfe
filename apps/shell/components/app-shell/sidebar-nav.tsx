"use client";

import {
  ArrowLeftRightIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@repo/ui";

import type { NavigationItem } from "@/lib/config";

const icons: Record<NavigationItem["icon"], LucideIcon> = {
  "layout-dashboard": LayoutDashboardIcon,
  users: UsersIcon,
  "list-checks": ListChecksIcon,
  "arrow-left-right": ArrowLeftRightIcon,
};

/**
 * Cross-application navigation is a link, not an import. A future Module
 * Federation migration replaces this list with mounted remotes; nothing else in
 * the shell changes.
 */
export function SidebarNav({ items }: { items: ReadonlyArray<NavigationItem> }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = icons[item.icon];
        const active =
          item.match === "/" ? pathname === "/" : pathname.startsWith(item.match);

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-80" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
