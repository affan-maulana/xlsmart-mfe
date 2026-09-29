import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiUrl, loginUrl } from "../config";
import { DEV_USER, devBypassEnabled } from "../dev-bypass";
import { SESSION_COOKIE } from "../cookies";

/**
 * Session resolution for the Customer360 domain.
 *
 * The domain's own backend verifies the JWT - this application never decodes,
 * stores or exposes it. Only non-sensitive profile fields are returned.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${apiUrl()}/v1/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Guards every server-rendered route in this application.
 *
 * The return path is the domain root rather than the deep link, because a
 * layout cannot read the current pathname. If deep-link return matters, move
 * this check into a proxy.ts and read request.nextUrl.pathname there.
 */
export async function requireSessionUser(): Promise<SessionUser> {
  if (devBypassEnabled()) return DEV_USER;
  const user = await getSessionUser();
  if (user) return user;

  redirect(loginUrl());
}
