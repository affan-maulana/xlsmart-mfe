import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

/*
 * Each application is an independently deployable unit.
 * basePath makes it servable under a sub-path behind NGINX:
 *   shell is mounted at the root: https://app.company.com
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
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  transpilePackages: ["@repo/ui"],
  allowedDevOrigins: ["localhost:3001", "localhost:3002", "localhost:3003", "127.0.0.1:3001", "127.0.0.1:3002", "127.0.0.1:3003"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
