import { NextResponse, type NextRequest } from "next/server";

import { clearSessionCookie } from "@/lib/auth/cookie";
import { readSessionToken } from "@/lib/auth/identity";
import { authApiUrl } from "@/lib/config";

/**
 * POST /auth/api/auth/logout
 *
 * Clears the cookie first and always, so a user can sign out even while the auth
 * service is down, then best-effort revokes the token at the issuer.
 */
export async function POST(request: NextRequest) {
  const token = await readSessionToken();

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);

  if (token) {
    await fetch(`${authApiUrl()}/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => null);
  }

  return response;
}
