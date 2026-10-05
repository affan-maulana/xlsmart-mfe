import "server-only";

/**
 * Server-only configuration for the shell.
 *
 * The shell is a platform application: global layout, navigation, user
 * information and the queue information widget. It holds no credentials and owns
 * no sign-in logic - identity lives in the auth application, which the shell
 * reaches over one HTTP contract, exactly as it reaches the Queue summary.
 *
 * Values resolve lazily so one build deploys to any environment.
 */

/**
 * Browser-facing base URL of the auth application.
 * Development: http://localhost:3004/auth   Production: /auth
 * Used for sign-in and sign-out links, which are navigations rather than fetches.
 */
export function authAppUrl(): string {
  return trimSlashes(required("AUTH_APP_URL", process.env.AUTH_APP_URL));
}

/**
 * This shell's absolute public origin, used to build the `?next=` target a
 * sign-in returns the user to. Required: the auth service honours only absolute
 * origins on its allowlist, so a relative target would be rejected.
 */
export function shellPublicUrl(path = "/"): string {
  return `${trimSlashes(required("PUBLIC_APP_URL", process.env.PUBLIC_APP_URL))}${path}`;
}

/** Queue application's published summary BFF endpoint. */
export function queueSummaryUrl(): string {
  return required("QUEUE_SUMMARY_URL", process.env.QUEUE_SUMMARY_URL);
}

/** Where an unauthenticated visitor is sent, asked to come back here after. */
export function loginUrlFor(path = "/"): string {
  const params = new URLSearchParams({ next: shellPublicUrl(path) });
  return `${authAppUrl()}/login?${params.toString()}`;
}

/** Sign-out as a navigation, so no application needs a credentialed fetch. */
export function logoutUrlFor(path = "/"): string {
  const params = new URLSearchParams({ next: shellPublicUrl(path) });
  return `${authAppUrl()}/logout?${params.toString()}`;
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[shell] Missing required environment variable ${name}. Copy .env.example to .env.local.`,
    );
  }
  return value;
}

function trimSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}
