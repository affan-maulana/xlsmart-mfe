"use client";

import type { ReactNode } from "react";

import type { NavItem } from "@repo/auth";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import type { AgentInfo } from "../lib/types";

export interface AppChromeProps {
  agent: AgentInfo;
  email?: string;
  navItems: ReadonlyArray<NavItem>;
  signOutHref: string;
  /** Brand mark served from the owning application's own public directory. */
  logoSrc?: string;
  /** Rendered in the sidebar footer (e.g. a queue information widget). */
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

/**
 * Global application chrome: a full-width header on top, and the platform
 * navigation beside the content. Navigation is an icon rail whose overlay
 * menu covers the header when opened. The owning application supplies
 * identity, navigation and links as props; the shell's own queue widget can
 * slot into the menu footer.
 */
export function AppChrome({
  agent,
  email,
  navItems,
  signOutHref,
  logoSrc,
  sidebarFooter,
  children,
}: AppChromeProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <AppHeader
        agent={agent}
        email={email}
        logoSrc={logoSrc}
        signOutHref={signOutHref}
      />

      <div className="flex min-h-0 flex-1">
        <AppSidebar items={navItems} logoSrc={logoSrc} footer={sidebarFooter} />
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
