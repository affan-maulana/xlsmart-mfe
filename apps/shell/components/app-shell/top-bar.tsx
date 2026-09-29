"use client";

import { LogOutIcon, MenuIcon } from "lucide-react";
import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@repo/ui";

import { DomainQuickLinks } from "@/components/app-shell/domain-quick-links";
import type { NavigationItem } from "@/lib/config";

interface TopBarProps {
  name?: string;
  email?: string;
  role?: string;
  items: ReadonlyArray<NavigationItem>;
  /**
   * Sign-out link supplied by the server. It points at the auth application, so
   * ending a session is a navigation - no application in this platform holds a
   * credential or needs a credentialed cross-origin fetch.
   */
  signOutHref: string;
}

/**
 * Header + top bar + user information. Only profile fields arrive here as props;
 * the identity behind them was resolved on the server.
 */
export function TopBar({ name, email, role, items, signOutHref }: TopBarProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const initials = (name ?? email ?? "?")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="Open navigation"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen((open) => !open)}
      >
        <MenuIcon />
      </Button>

      <DomainQuickLinks items={items} className="hidden md:hidden" mobileOpen={mobileNavOpen} />

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "rounded-full outline-none",
                "focus-visible:ring-ring focus-visible:ring-[3px]",
              )}
            >
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Account menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="grid gap-0.5">
              <span className="truncate text-sm font-medium">{name ?? "Signed in"}</span>
              {email ? (
                <span className="text-muted-foreground truncate text-xs font-normal">{email}</span>
              ) : null}
              {role ? (
                <span className="text-muted-foreground text-xs font-normal capitalize">{role}</span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild variant="destructive">
              <a href={signOutHref}>
                <LogOutIcon />
                Sign out
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
