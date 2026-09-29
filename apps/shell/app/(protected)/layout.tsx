import type { ReactNode } from "react";

import { requireSessionUser } from "@/lib/auth/session";
import { getNavigation, logoutUrlFor } from "@/lib/config";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopBar } from "@/components/app-shell/top-bar";
import { QueueInformationWidget } from "@/components/queue-information-widget";

export const dynamic = "force-dynamic";

/**
 * The shell's only job: global layout, navigation, user information and the
 * queue information widget. Domain screens are separate applications reached
 * through plain links - never imported here. Sign-in and sign-out belong to the
 * auth application; the shell only links to them.
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireSessionUser("/");
  const items = getNavigation();

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md text-xs font-bold">
            M
          </span>
          <span className="text-sm font-semibold tracking-tight">Meteor Platform</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Primary">
          <SidebarNav items={items} />
        </nav>

        <div className="border-t p-3">
          <QueueInformationWidget />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          name={user.name}
          email={user.email}
          role={user.role}
          items={items}
          signOutHref={logoutUrlFor("/")}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
