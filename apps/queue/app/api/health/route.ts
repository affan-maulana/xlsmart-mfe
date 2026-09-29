/**
 * Liveness probe for Docker and NGINX. Intentionally public and side-effect
 * free: it reports that this application is up, not whether a user is signed in.
 */
const SERVICE = "queue";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    service: SERVICE,
    version: process.env.APP_VERSION ?? "dev",
    timestamp: new Date().toISOString(),
  });
}
