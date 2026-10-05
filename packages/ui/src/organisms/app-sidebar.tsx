"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { NavIconName, NavItem } from "@repo/auth";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MenuIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "../ui/button";
import { BRAND_LOGO_SRC } from "../brand";
import { cn } from "../lib/utils";

const icons: Record<NavIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboardIcon,
  users: UsersIcon,
  "list-checks": ListChecksIcon,
  "arrow-left-right": ArrowLeftRightIcon,
  "bar-chart": BarChart3Icon,
  settings: SettingsIcon,
};

export interface AppSidebarProps {
  items: ReadonlyArray<NavItem>;
  /** Brand mark for the overlay menu header, served from the owner's public directory. */
  logoSrc?: string;
  /** Rendered at the bottom of the overlay menu (e.g. a queue information widget). */
  footer?: ReactNode;
}

/**
 * Platform navigation: a fixed icon rail plus a full-height overlay menu. The
 * rail never expands; the burger opens the menu as a slide-in overlay that
 * covers the header without reflowing the page. Items with children reveal a
 * floating submenu on hover, aligned to the parent row. Purely presentational
 * - navigation items arrive as props from the owner.
 */
export function AppSidebar({
  items,
  logoSrc = BRAND_LOGO_SRC,
  footer,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  };

  return (
    <>
      <aside
        aria-label="Primary"
        className="bg-sidebar text-sidebar-foreground sticky top-16 hidden h-[calc(100vh_-_4rem)] w-16 shrink-0 flex-col items-center gap-1 border-r md:flex"
      >
        <div className="border-b p-4 my-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon className="size-5" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col items-center gap-1 pt-2">
          {items.map((item) => {
            const Icon = icons[item.icon];
            const active = isItemActive(pathname, item);
            const hasChildren = Boolean(item.children?.length);
            const className = cn(
              "flex size-10 items-center justify-center rounded-lg transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            );

            return hasChildren ? (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(true)}
                className={className}
              >
                <Icon className="size-5" />
              </button>
            ) : (
              <a
                key={item.id}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                <Icon className="size-5" />
              </a>
            );
          })}
        </nav>
      </aside>

      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={closeMenu}
        className={cn(
          "fixed inset-0 z-[55] bg-black/50 transition-[opacity,visibility] duration-300",
          menuOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      />

      {/* Sidebar opened */}
      <div
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-[60] flex h-screen w-72 max-w-[80vw] flex-col border-r shadow-xl transition-[transform,visibility] duration-300 ease-in-out",
          menuOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <div className="border-b p-4">
          <Image
            src={logoSrc}
            alt="XLSMART"
            width={140}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </div>

        <div className="border-b p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMenu}
            className="w-full justify-start"
          >
            <ChevronLeftIcon className="size-4" />
            Menu
          </Button>
        </div>

        <nav className="flex-1 p-3">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = icons[item.icon];
              const active = isItemActive(pathname, item);
              const hasChildren = Boolean(item.children?.length);
              const submenuOpen = hasChildren && openSubmenu === item.id;

              return (
                <li
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenSubmenu(item.id)}
                  onMouseLeave={() => hasChildren && setOpenSubmenu(null)}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      aria-expanded={submenuOpen}
                      aria-current={active ? "page" : undefined}
                      onClick={() =>
                        setOpenSubmenu((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                      <span className="flex-1 truncate text-left">
                        {item.label}
                      </span>
                      <ChevronRightIcon className="size-4 shrink-0" />
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMenu}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  )}

                  {submenuOpen && item.children ? (
                    <div className="bg-popover text-popover-foreground absolute top-0 left-full z-[70] ml-4 min-w-44 rounded-lg border p-1 shadow-lg before:absolute before:inset-y-0 before:-left-4 before:w-4 before:content-['']">
                      {item.children.map((child) => {
                        const childActive = isMatchActive(
                          pathname,
                          child.match ?? child.href,
                        );

                        return (
                          <a
                            key={child.id}
                            href={child.href}
                            aria-current={childActive ? "page" : undefined}
                            onClick={closeMenu}
                            className={cn(
                              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              childActive
                                ? "bg-primary text-primary-foreground"
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            )}
                          >
                            {child.label}
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        {footer ? <div className="border-t p-3">{footer}</div> : null}
      </div>
    </>
  );
}

function isMatchActive(pathname: string, match: string): boolean {
  return (
    match !== "#" &&
    (match === "/" ? pathname === "/" : pathname.startsWith(match))
  );
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (isMatchActive(pathname, item.match ?? item.href)) return true;
  return (
    item.children?.some((child) =>
      isMatchActive(pathname, child.match ?? child.href),
    ) ?? false
  );
}
