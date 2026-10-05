"use client";

import Image from "next/image";
import { BellIcon, LogOutIcon, MapPinIcon } from "lucide-react";

import { Button } from "../ui/button";
import { BRAND_LOGO_SRC } from "../brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { AgentInfo } from "../lib/types";

export interface AppHeaderProps {
  agent: AgentInfo;
  email?: string;
  /** Brand mark served from each application's own public directory. */
  logoSrc?: string;
  /**
   * Sign-out link supplied by the owning application. It points at the auth
   * application, so ending a session is a navigation - no application in this
   * platform holds a credential or needs a credentialed cross-origin fetch.
   */
  signOutHref: string;
}

/**
 * Full-width platform header: brand on the left; location, notifications and
 * the signed-in staff member on the right. Pure presentational - every value
 * arrives as a prop from the owning application.
 */
export function AppHeader({
  agent,
  email,
  logoSrc = BRAND_LOGO_SRC,
  signOutHref,
}: AppHeaderProps) {
  return (
    <header className="bg-background/95 sticky top-0 z-50 flex h-16 w-full shrink-0 items-center gap-3 border-b px-4 backdrop-blur">
      <Image
        src={logoSrc}
        alt="XLSMART"
        width={140}
        height={32}
        priority
        className="h-8 w-auto"
      />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="text-white hidden items-center gap-1.5 rounded-full bg-[linear-gradient(90deg,#E5005A,#1E22AA)] px-3 py-1.5 text-sm font-medium sm:inline-flex">
          <MapPinIcon strokeWidth={4} className="size-4" />
          {agent.location}
        </span>

        <div className="bg-border h-6 w-px" />

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <BellIcon className="size-7 fill-current" />
          {agent.hasNotification ? (
            <span className="bg-destructive absolute top-2 right-2 size-2 rounded-full ring-2 ring-background" />
          ) : null}
        </Button>

        <div className="hidden text-right leading-tight lg:block">
          <p className="text-sm font-semibold">{agent.name}</p>
          <p className="text-muted-foreground text-xs">{agent.crrCode}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
            >
              <Image
                src={agent.avatarUrl}
                alt={agent.name || "Staff avatar"}
                width={40}
                height={40}
                className="ring-primary/20 size-10 rounded-full object-cover ring-2"
              />
              <span className="sr-only">Account menu</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="grid gap-0.5">
              <span className="truncate text-sm font-medium">
                {agent.name || "Signed in"}
              </span>
              {email ? (
                <span className="text-muted-foreground truncate text-xs font-normal">
                  {email}
                </span>
              ) : null}
              <span className="text-muted-foreground text-xs font-normal">
                {agent.crrCode}
              </span>
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
