import "server-only";

/**
 * Development-only escape hatch, so the platform can be browsed without the Go
 * services running. Opt in with `AUTH_DEV_BYPASS=1` in `apps/auth/.env.local`
 * (and the same in any domain app you want to open directly).
 *
 * Two things make this safe rather than a back door:
 *
 *   1. It is env-controlled, never request-controlled. No header, cookie, body
 *      field or URL can trigger it.
 *   2. A production process that has it set FAILS LOUDLY on every request
 *      instead of quietly accepting anyone. Refusing to start is the only
 *      correct response to "the credential check is switched off" in an
 *      environment that has real users.
 *
 * The bypass covers identity only. Domain data still comes from the real Go
 * services, so screens show their honest "service unavailable" states rather
 * than fabricated customer, queue or migration records.
 */

export const DEV_BYPASS_TOKEN = "dev-bypass-token";

export interface DevUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const DEV_USER: DevUser = {
  id: "dev-user",
  name: "Dev Operator",
  email: "dev@localhost",
  role: "agent",
};

export function devBypassEnabled(): boolean {
  if (process.env.AUTH_DEV_BYPASS !== "1") return false;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_DEV_BYPASS is set while NODE_ENV=production. Unset AUTH_DEV_BYPASS before deploying.",
    );
  }

  return true;
}
