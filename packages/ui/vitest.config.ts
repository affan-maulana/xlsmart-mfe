import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    // React only exposes `act` from its development build, which Testing
    // Library needs. Vitest defaults NODE_ENV to production otherwise.
    env: { NODE_ENV: "development" },
  },
});
