import type { NextConfig } from "next";

import { fileURLToPath } from "node:url";

import { basePath } from "./lib/base-path";

/*
 * Each application is an independently deployable unit.
 * basePath makes it servable under a sub-path behind NGINX:
 *   https://app.company.com/queue  ->  this application
 *
 * output: "standalone" produces a self-contained server bundle for Docker.
 */
// With output: "standalone" in a monorepo, Next must know the workspace root so
// the Docker image traces the right node_modules.
const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url));

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  basePath,
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: ["@repo/ui"],
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
