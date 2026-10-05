import type { ReactNode } from "react";

import { getNavigation, requireSession, type NavItem } from "@repo/auth";
import {
  AppChrome,
  BRAND_AVATAR_SRC,
  BRAND_LOGO_SRC,
} from "@repo/ui";

import { loginUrl, logoutUrl, withBasePath } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * The chrome is presentational: identity and staff metadata arrive from the
 * shared session contract (@repo/auth), navigation from the shared platform
 * contract. Only the app-specific Settings entry is local - it carries the
 * design-phase submenu sample. Real values replace the placeholders without
 * touching the shared packages. Brand asset paths come from @repo/ui; this
 * application serves its own copies under public/images/, so each is wrapped
 * with this application's basePath.
 */
const LOGO_SRC = withBasePath(BRAND_LOGO_SRC);
const AVATAR_SRC = withBasePath(BRAND_AVATAR_SRC);

const settingsItem: NavItem = {
  id: "settings",
  label: "Settings",
  href: "#",
  icon: "settings",
  children: [
    { id: "settings-profile", label: "Profile", href: "#" },
    { id: "settings-preferences", label: "Preferences", href: "#" },
    { id: "settings-notifications", label: "Notifications", href: "#" },
  ],
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireSession({ loginUrl: loginUrl() });
  const navItems = [...(await getNavigation()), settingsItem];

  return (
    <AppChrome
      agent={{
        id: user.id,
        name: user.name,
        crrCode: user.staffId ?? "",
        location: user.locationName ?? "",
        avatarUrl: AVATAR_SRC,
        hasNotification: true,
      }}
      email={user.email}
      navItems={navItems}
      signOutHref={logoutUrl()}
      logoSrc={LOGO_SRC}
    >
      <div className="w-full">{children}</div>
    </AppChrome>
  );
}
