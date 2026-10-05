import "server-only";

/**
 * Development-only escape hatch. Opt in with `AUTH_DEV_BYPASS=1` in an
 * application's `.env.local`.
 *
 * Env-controlled, never request-controlled, and a production process that has
 * it set fails loudly on every request instead of accepting unsigned traffic.
 *
 * Centralised here because every application's session helper honours it; the
 * auth application keeps its own copy because its bypass also mints tokens.
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
