import "server-only";

import { cookies } from "next/headers";

import { DEV_BYPASS_TOKEN, DEV_USER, devBypassEnabled } from "./dev-bypass";
import { authApiUrl, sessionCookie } from "../config";

/**
 * Credential and identity handling. Nothing in this file may be reached from a
 * Client Component, and the token value must never leave it in a response body.
 *
 * AUTH_DEV_BYPASS=1 + NODE_ENV=development short-circuits the auth service.
 * This is the identity layer's equivalent of the login-route bypass: the cookie
 * is still set, the HttpOnly/secure attributes still apply, but a fixed dev
 * token is accepted without hitting /v1/me. A production process that has the
 * flag set throws rather than silently accepting unsigned traffic.
 */

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Reads the session cookie. Only this application interprets its value. */
export async function readSessionToken(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(sessionCookie.name)?.value;
  return value && value.length > 0 ? value : null;
}

/**
 * Verifies a bearer token by asking the auth service, which is the only party
 * holding a signing secret. This application never decodes or validates the JWT
 * itself - a forged token simply fails here, the same as anywhere else.
 */
export type IdentityResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; status: 401 | 503 };

export async function verifyToken(token: string): Promise<IdentityResult> {
  if (devBypassEnabled() && token === DEV_BYPASS_TOKEN) {
    return { ok: true, user: DEV_USER };
  }

  let response: Response;
  try {
    response = await fetch(`${authApiUrl()}/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 503 };
  }

  if (response.status === 401 || response.status === 403) return { ok: false, status: 401 };
  if (!response.ok) return { ok: false, status: 503 };

  const payload = await response.json().catch(() => null);
  const user = toAuthenticatedUser(payload);

  return user ? { ok: true, user } : { ok: false, status: 401 };
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  if (devBypassEnabled()) return DEV_USER;

  const token = await readSessionToken();
  if (!token) return null;

  const result = await verifyToken(token);
  return result.ok ? result.user : null;
}

/**
 * Whitelist projection. Whatever the auth service returns, only these fields
 * cross an application boundary - never a token, never an internal identifier.
 */
export function toAuthenticatedUser(payload: unknown): AuthenticatedUser | null {
  if (typeof payload !== "object" || payload === null) return null;

  const source = "user" in payload ? (payload as { user: unknown }).user : payload;
  if (typeof source !== "object" || source === null) return null;

  const record = source as Record<string, unknown>;
  const pick = (key: keyof AuthenticatedUser) =>
    typeof record[key] === "string" && record[key] !== "" ? (record[key] as string) : null;

  const id = pick("id");
  const email = pick("email");
  if (!id || !email) return null;

  return {
    id,
    email,
    name: pick("name") ?? email.split("@")[0] ?? email,
    role: pick("role") ?? "user",
  };
}
