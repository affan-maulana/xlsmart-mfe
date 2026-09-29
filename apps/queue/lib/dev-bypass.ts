import "server-only";

/**
 * Development-only escape hatch (see apps/auth for the rationale). Opt in with
 * `AUTH_DEV_BYPASS=1` in this application's `.env.local`.
 *
 * Env-controlled, never request-controlled, and a production process that has
 * it set fails loudly on every request instead of accepting unsigned traffic.
 *
 * Duplicated per application on purpose: packages/config is not permitted, and
 * three small copies are cheaper than a shared abstraction nobody has earned.
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
