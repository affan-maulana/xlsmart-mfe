import { NextResponse, type NextRequest } from "next/server";

import { loginSchema } from "@/lib/auth/schema";
import { issueSessionCookie } from "@/lib/auth/cookie";
import { DEV_BYPASS_TOKEN, DEV_USER, devBypassEnabled } from "@/lib/auth/dev-bypass";
import { verifyToken } from "@/lib/auth/identity";
import { authApiUrl } from "@/lib/config";

/**
 * POST /auth/api/auth/login
 *
 * Browser -> here -> Go auth service -> session cookie on the response.
 *
 * When AUTH_DEV_BYPASS=1 and NODE_ENV=development, the upstream call is skipped
 * and a fixed dev cookie is issued instead. This is an env-controlled escape
 * hatch for local development only - a production process that has the flag set
 * throws immediately rather than silently accepting any credentials.
 *
 * The same-origin check, the schema validation and the HttpOnly cookie path are
 * all still exercised, so a developer can test the full login flow without the
 * Go services running.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  const raw = await request.json().catch(() => null);

  // Dev bypass: skip schema validation and the upstream call entirely.
  if (devBypassEnabled()) {
    const response = NextResponse.json({ user: DEV_USER, dev: true }, { status: 200 });
    issueSessionCookie(response, DEV_BYPASS_TOKEN);
    return response;
  }

  const payload = loginSchema.safeParse(raw);
  if (!payload.success) {
    return NextResponse.json(
      {
        message: "Check your credentials",
        issues: payload.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  // Resolved before the try: a missing variable is a misconfiguration, not an
  // auth-service outage, and must not be reported to operators as one.
  const upstreamLogin = `${authApiUrl()}/v1/auth/login`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamLogin, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload.data),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "The authentication service is unavailable. Try again shortly." },
      { status: 503 },
    );
  }

  if (!upstream.ok) {
    const status = upstream.status === 401 ? 401 : upstream.status;
    return NextResponse.json(
      {
        message:
          status === 401
            ? "Email or password is incorrect"
            : "Sign in failed. Try again shortly.",
      },
      { status },
    );
  }

  const session = await upstream.json().catch(() => null);
  const token = readToken(session);

  if (!token) {
    return NextResponse.json(
      { message: "The authentication service returned an unexpected response." },
      { status: 502 },
    );
  }

  // Reject a token the service will not itself honour, so a malformed session is
  // never handed to the browser as if it were signed in.
  const identity = await verifyToken(token);
  if (!identity.ok) {
    return NextResponse.json(
      { message: "The authentication service returned an unexpected response." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ user: identity.user }, { status: 200 });
  issueSessionCookie(response, token);
  return response;
}

function readToken(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const candidate =
    typeof record.token === "string" ? record.token : record.access_token;
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
