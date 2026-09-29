import "server-only";

/**
 * Server-only configuration for the identity application.
 *
 * This is the only application that reaches the Go auth service, and the only
 * one that issues or clears the session cookie. `pnpm check:architecture`
 * enforces both. Resolved lazily so one image promotes across environments.
 */

const isProduction = process.env.NODE_ENV === "production";

/** The Go auth service. Owned by the backend repository. */
export function authApiUrl(): string {
  return trimSlashes(required("AUTH_API_URL", process.env.AUTH_API_URL));
}

/**
 * Where to send someone who arrives at sign-in with no usable `?next=`.
 * Must be an absolute URL on this platform, e.g. https://app.company.com/
 */
export function defaultReturnUrl(): string {
  return process.env.DEFAULT_RETURN_URL ?? "/";
}

/**
 * Origins a post-login redirect may target: the platform's own public origin in
 * production, and every application's dev port in development.
 *
 * This is an allowlist of *this platform's* origins, not a wildcard - an
 * attacker's origin is refused, and the visitor lands on DEFAULT_RETURN_URL.
 * Leaving it empty means every return target is refused, so configure it in
 * every environment.
 */
export function allowedReturnOrigins(): ReadonlySet<string> {
  const raw = process.env.ALLOWED_RETURN_ORIGINS ?? "";
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim().replace(/\/+$/, ""))
      .filter((value) => value.length > 0),
  );
}

/**
 * One cookie for the whole platform. Path=/ plus the shared parent domain is
 * what lets /customer360, /queue and /pretopost reuse a single sign-in.
 *
 * Attributes are a cross-application contract: the domain applications read this
 * cookie name to build their Bearer header, and each declares the constant
 * locally because packages/config is not permitted.
 */
export const sessionCookie = {
  name: "mfe_session",
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[auth] Missing required environment variable ${name}. Copy .env.example to .env.local.`,
    );
  }
  return value;
}

function trimSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}
