import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    // React only exposes `act` from its development build.
    env: { NODE_ENV: "development" },
  },
  resolve: {
    alias: {
      "@": root,
      "@repo/ui": `${root}../../packages/ui/src/index.ts`,
      // The real package throws outside a React Server environment.
      "server-only": `${root}test/server-only.ts`,
    },
  },
});
