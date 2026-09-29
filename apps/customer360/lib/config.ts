import "server-only";

import { basePath } from "./base-path";

/**
 * Server-only configuration for the Customer360 domain application.
 *
 * Customer360 talks to exactly one backend: its own Go service. No other frontend
 * application's code or data is reachable from here, and this application holds
 * no sign-in logic - identity belongs to the auth application.
 *
 * Values resolve lazily so an image can be built once and promoted to any
 * environment - nothing is baked into the bundle at build time.
 */

/** Route prefix this application is mounted on behind NGINX. */
export { basePath } from "./base-path";

/** The Customer360 Go backend. This application's BFF is its only frontend caller. */
export function apiUrl(): string {
  return trimSlashes(required("CUSTOMER360_API_URL", process.env.CUSTOMER360_API_URL));
}

/**
 * The shell application owns global navigation, so the "back to dashboard" link
 * points there. Behind NGINX everything is same-origin and this is unset.
 */
export function shellUrl(): string {
  return trimSlashes(process.env.SHELL_URL ?? "");
}

/**
 * This application's browser-facing URL, used as the post-login return target.
 * Development: the shell's next= must name our port explicitly. Production:
 * PUBLIC_APP_URL is unset, so the target is a plain same-origin path.
 */
export function publicAppUrl(path = ""): string {
  return `${trimSlashes(required("PUBLIC_APP_URL", process.env.PUBLIC_APP_URL))}${basePath}${path}`;
}

/**
 * Sign-in is a navigation to the auth application. This application never reads
 * the cookie value to decide that - it forwards it to its own backend, which
 * answers 401 for anything unusable.
 */
export function loginUrl(): string {
  const auth = trimSlashes(required("AUTH_APP_URL", process.env.AUTH_APP_URL));
  const params = new URLSearchParams({ next: publicAppUrl() });
  return `${auth}/login?${params.toString()}`;
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[customer360] Missing required environment variable ${name}. Copy .env.example to .env.local.`,
    );
  }
  return value;
}

function trimSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}
