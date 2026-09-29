import "server-only";

import { apiUrl } from "./config";
import { DEV_BYPASS_TOKEN, devBypassEnabled } from "./dev-bypass";
import { getAccessToken } from "./auth/session";

/**
 * The server-side half of this application's BFF.
 *
 * Server Components call it directly; route handlers call it to serve the
 * browser. Either way the HttpOnly cookie's JWT becomes an Authorization
 * header, and the browser never holds the token.
 *
 * SECURITY DEPENDENCY: the token is forwarded without being verified here,
 * because this application deliberately holds no signing secret - only the
 * issuing service can verify it. Every endpoint on the domain Go service must
 * therefore authenticate the Bearer token itself. `/v1/session` is the guard
 * this application uses for page access, so a forged or expired token cannot
 * render a page even if a service endpoint were misconfigured.
 */

export class UpstreamError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

export interface BffRequest {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

export async function bffFetch<T>({
  path,
  method = "GET",
  body,
  searchParams,
  signal,
}: BffRequest): Promise<T> {
  const token = await getAccessToken() ?? (devBypassEnabled() ? DEV_BYPASS_TOKEN : null);

  // Refuse to proxy anonymously. Without this the request would reach the
  // domain service with no credentials at all, and safety would depend entirely
  // on that service being configured to reject them.
  if (!token) {
    throw new UpstreamError(401, "Sign in required.");
  }

  const url = new URL(`${apiUrl()}${path}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        accept: "application/json",
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal,
    });
  } catch (cause) {
    if ((cause as Error)?.name === "AbortError") throw cause;
    throw new UpstreamError(503, "The PreToPost service is unreachable.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new UpstreamError(response.status, "Your session has expired.");
  }
  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    throw new UpstreamError(response.status, await describeFailure(response));
  }

  return (await response.json()) as T;
}

/** Never forward raw upstream bodies to the browser: they can contain internals. */
async function describeFailure(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as { message?: unknown } | null;
  if (typeof payload?.message === "string" && payload.message.length <= 200) {
    return payload.message;
  }
  return response.status === 404 ? "Not found." : "The request could not be completed.";
}

/** Route handlers translate BFF errors into safe, uniform JSON responses. */
export function errorResponse(error: unknown): Response {
  if (error instanceof UpstreamError) {
    const status = error.status === 503 ? 503 : error.status;
    return Response.json({ message: error.message }, { status });
  }
  return Response.json({ message: "Unexpected server error." }, { status: 500 });
}
