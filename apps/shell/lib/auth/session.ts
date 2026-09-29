import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DEV_USER, devBypassEnabled } from "../dev-bypass";
import { authSessionUrl, loginUrlFor } from "../config";

/**
 * Identity for the shell.
 *
 * The shell never reads the session cookie's value. It relays the incoming
 * `Cookie` header to the auth application's identity contract and receives
 * whitelisted profile fields back, so credential handling stays in one
 * deployable. The relayed header is used for this call only - never logged,
 * never rendered, never returned to a Client Component.
 *
 * AUTH_DEV_BYPASS=1 + NODE_ENV=development returns the dev user directly
 * without contacting the auth application, so the shell is navigable without
 * any running services. This is an escape hatch for local development only.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type Identity =
  | { status: "authenticated"; user: SessionUser }
  | { status: "anonymous" }
  | { status: "unavailable" };

export async function getIdentity(): Promise<Identity> {
  if (devBypassEnabled()) {
    return { status: "authenticated", user: DEV_USER };
  }

  const cookieHeader = (await headers()).get("cookie");
  if (!cookieHeader) return { status: "anonymous" };

  try {
    const response = await fetch(authSessionUrl(), {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) return { status: "anonymous" };
    if (!response.ok) return { status: "unavailable" };

    const body = (await response.json()) as { authenticated?: boolean; user?: SessionUser };

    return body.authenticated && body.user
      ? { status: "authenticated", user: body.user }
      : { status: "anonymous" };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * Guards the shell's server-rendered routes.
 *
 * Both "signed out" and "identity unreachable" send the visitor to sign-in: the
 * shell will not render a dashboard for an identity it cannot confirm. The login
 * screen surfaces the difference, because it can report an auth-service outage
 * rather than pretending the credentials were wrong.
 */
export async function requireSessionUser(path = "/"): Promise<SessionUser> {
  const identity = await getIdentity();
  if (identity.status === "authenticated") return identity.user;

  redirect(loginUrlFor(path));
}
