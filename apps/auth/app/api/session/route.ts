import { NextResponse } from "next/server";

import { readSessionToken, verifyToken } from "@/lib/auth/identity";
import { devBypassEnabled, DEV_USER } from "@/lib/auth/dev-bypass";

/**
 * GET /auth/api/session — the platform's identity contract.
 *
 * Other applications need to know who is signed in for their own chrome, but
 * none of them may interpret the session cookie. They relay the incoming
 * `Cookie` header here and receive whitelisted profile fields back. That keeps
 * credential handling in exactly one deployable.
 *
 * AUTH_DEV_BYPASS=1 + NODE_ENV=development returns the dev user even with no
 * cookie, so the platform is navigable without the Go services or a login
 * flow. This is an escape hatch for local development only.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  if (devBypassEnabled()) {
    return NextResponse.json(
      { authenticated: true, user: DEV_USER, dev: true },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  const token = await readSessionToken();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const result = await verifyToken(token);

  if (!result.ok) {
    return NextResponse.json(
      {
        authenticated: false,
        // Distinguish "signed out / bad token" from "identity service down" so
        // callers can show the right state instead of bouncing a signed-in user
        // back to the login screen during an outage.
        unavailable: result.status === 503,
      },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { authenticated: true, user: result.user },
    { headers: { "cache-control": "private, no-store" } },
  );
}
