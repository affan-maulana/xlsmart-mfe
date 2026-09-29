import { allowedReturnOrigins, defaultReturnUrl } from "../config";

/**
 * Post-login redirect targets, validated here and nowhere else.
 *
 * `?next=` is where a sign-in page becomes an open redirect, and this platform
 * has an extra hazard: an application's `redirect()` applies its own basePath to
 * a root-relative target, so `next=/queue` handed to the auth app becomes
 * `/auth/queue`. A return target must therefore be an ABSOLUTE URL whose origin
 * is explicitly allowlisted - one rule that works identically in development
 * (separate ports) and production (separate sub-paths).
 *
 * Anything else - a relative path, an unlisted origin, `//host`, `javascript:` -
 * falls back to the configured landing page. So every environment must set
 * ALLOWED_RETURN_ORIGINS to its own public origin, or users always land on
 * DEFAULT_RETURN_URL instead of where they came from.
 */

function first(value: string | string[] | null | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

export function resolveReturnTarget(
  raw: string | string[] | null | undefined,
  fallback: string = defaultReturnUrl(),
): string {
  const candidate = first(raw)?.trim();
  if (!candidate) return fallback;

  if (/^https?:\/\//i.test(candidate)) {
    const url = parseUrl(candidate);
    // Reject a URL that parses to something other than http(s) even if the
    // prefix looked acceptable, and reject any origin not explicitly listed.
    if (url && url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    // Emit the parsed form, not the raw string: `HTTP://Localhost:3002/x` passes
    // the origin check, and handing back the attacker's casing invites whatever
    // reads it next to normalise it differently.
    return url && allowedReturnOrigins().has(url.origin) ? url.href : fallback;
  }

  return fallback;
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
