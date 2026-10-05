import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { DEV_USER, devBypassEnabled } from "./dev-bypass";
import { mapSessionUser } from "./metadata";
import type { SessionResult, SessionUser } from "./types";

/**
 * Platform session helpers.
 *
 * No application reads the session cookie's value to decide who is signed in.
 * They relay the incoming `Cookie` header to the auth application's identity
 * contract and receive whitelisted profile fields back, so credential
 * handling stays in exactly one deployable. The relayed header is used for
 * this call only - never logged, never rendered, never returned to a Client
 * Component.
 *
 * `getSessionToken` is the one deliberate exception: a domain BFF forwards
 * the opaque token to its own backend as `Authorization: Bearer`, which is
 * the documented server-side conversion - the browser never holds it.
 */

/** Must match the cookie name the auth application issues. */
export const SESSION_COOKIE = "mfe_session";

/** The auth application's identity contract, resolved lazily per request. */
function sessionUrl(): string {
  const value = process.env.AUTH_SESSION_URL;
  if (!value) {
    throw new Error(
      "[repo/auth] Missing required environment variable AUTH_SESSION_URL. Copy .env.example to .env.local.",
    );
  }
  return value.replace(/\/+$/, "");
}

/**
 * The raw session token for a domain BFF to forward to its own backend.
 * Returns null when unsigned; never leaves the server.
 */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Who is signed in, as a typed result.
 *
 * AUTH_DEV_BYPASS=1 + NODE_ENV=development returns the dev user directly
 * without contacting the auth application, so the platform is navigable
 * without any running services. Escape hatch for local development only.
 */
export async function getSession(): Promise<SessionResult> {
  if (devBypassEnabled()) {
    return { status: "authenticated", user: mapSessionUser(DEV_USER) };
  }

  const cookieHeader = (await headers()).get("cookie");
  if (!cookieHeader) return { status: "anonymous" };

  try {
    const response = await fetch(sessionUrl(), {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return { status: "anonymous" };
    }
    if (!response.ok) return { status: "unavailable" };

    const body = (await response.json()) as { authenticated?: boolean; user?: unknown };

    return body.authenticated && body.user
      ? { status: "authenticated", user: mapSessionUser(body.user) }
      : { status: "anonymous" };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * Guard for server-rendered routes.
 *
 * Both "signed out" and "identity unreachable" send the visitor to sign-in:
 * an application will not render a screen for an identity it cannot confirm.
 * The caller supplies its own login URL, because the post-login return
 * target is per-application configuration.
 */
export async function requireSession({ loginUrl }: { loginUrl: string }): Promise<SessionUser> {
  const session = await getSession();
  if (session.status === "authenticated") return session.user;

  redirect(loginUrl);
}
