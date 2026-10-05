import type { NavItem } from "./types";

/**
 * Platform navigation metadata.
 *
 * The canonical cross-application menu: dashboard plus each domain
 * application. Hrefs default to same-origin sub-paths behind NGINX and can be
 * overridden per environment (absolute origins while apps run on separate
 * dev ports). Resolved lazily so one build promotes across environments.
 *
 * Async by contract: navigation may later be filtered by the signed-in
 * user's role or permissions without changing any caller.
 */
export async function getNavigation(): Promise<NavItem[]> {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/",
      match: "/",
      icon: "layout-dashboard",
    },
    {
      id: "customer360",
      label: "Customer360",
      href: href("CUSTOMER360_URL", "/customer360"),
      match: "/customer360",
      icon: "users",
    },
    {
      id: "queue",
      label: "Queue",
      href: href("QUEUE_URL", "/queue"),
      match: "/queue",
      icon: "list-checks",
    },
    {
      id: "subscription-management",
      label: "PreToPost",
      href: href("SUBSCRIPTION_MANAGEMENT_URL", "/subscription-management"),
      match: "/subscription-management",
      icon: "arrow-left-right",
    },
  ];
}

function href(name: string, fallback: string): string {
  return (process.env[name] ?? fallback).replace(/\/+$/, "");
}
