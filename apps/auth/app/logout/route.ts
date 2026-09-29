import { NextResponse, type NextRequest } from "next/server";

import { clearSessionCookie } from "@/lib/auth/cookie";
import { resolveReturnTarget } from "@/lib/auth/return-path";
import { readSessionToken } from "@/lib/auth/identity";
import { authApiUrl } from "@/lib/config";
import { withBasePath } from "@/lib/base-path";

/**
 * GET /auth/logout — link-based sign-out.
 *
 * Sign-out is a navigation, not a fetch, so the shell and the domain
 * applications can end a session with a plain <a href>. Doing it with fetch()
 * would mean a credentialed cross-origin call in development (where each
 * application runs on its own port) and would buy nothing in production.
 *
 * `?next=` is carried through to the login page - validated, so a hostile value
 * becomes the platform landing page rather than a redirect.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = await readSessionToken();
  const target = resolveReturnTarget(request.nextUrl.searchParams.get("next"));

  const login = new URL(withBasePath("/login"), request.url);
  login.searchParams.set("next", target);

  const response = NextResponse.redirect(login);
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
