import type { ReactNode } from "react";

import { getNavigation, requireSession } from "@repo/auth";
import { AppChrome, BRAND_AVATAR_SRC } from "@repo/ui";

import { loginUrlFor, logoutUrlFor } from "@/lib/config";
import { QueueInformationWidget } from "@/components/queue-information-widget";

export const dynamic = "force-dynamic";

/**
 * The shell's only job: global layout, navigation, user information and the
 * queue information widget. Domain screens are separate applications reached
 * through plain links - never imported here. Sign-in and sign-out belong to the
 * auth application; the shell only links to them. Staff metadata and the
 * navigation contract come from @repo/auth - nothing is hardcoded here.
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireSession({ loginUrl: loginUrlFor("/") });
  const navItems = await getNavigation();

  return (
    <AppChrome
      agent={{
        id: user.id,
        name: user.name,
        crrCode: user.staffId ?? "",
        location: user.locationName ?? "",
        avatarUrl: BRAND_AVATAR_SRC,
        hasNotification: true,
      }}
      email={user.email}
      navItems={navItems}
      signOutHref={logoutUrlFor("/")}
      sidebarFooter={<QueueInformationWidget />}
    >
      {children}
    </AppChrome>
  );
}
