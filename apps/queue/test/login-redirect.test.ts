import { describe, expect, it } from "vitest";

import { loginUrl, publicAppUrl } from "@/lib/config";

/**
 * Regression guard for how a domain application points at the auth service.
 *
 * PUBLIC_APP_URL is an origin; the basePath is appended here. When that split
 * was misunderstood the platform emitted next=...3002/queue/queue, which sent
 * users back to a route that does not exist.
 */
describe("login redirect target", () => {
  it("appends the basePath exactly once", () => {
    expect(publicAppUrl()).toBe("http://localhost:3002/queue");
    expect(publicAppUrl("/q1")).toBe("http://localhost:3002/queue/q1");

    const url = new URL(loginUrl());
    expect(url.origin + url.pathname).toBe("http://localhost:3004/auth/login");
    expect(url.searchParams.get("next")).toBe("http://localhost:3002/queue");
  });

  it("fails loudly instead of emitting a target the auth service would reject", () => {
    const previous = process.env.PUBLIC_APP_URL;
    delete process.env.PUBLIC_APP_URL;

    try {
      expect(() => loginUrl()).toThrow(/PUBLIC_APP_URL/);
    } finally {
      process.env.PUBLIC_APP_URL = previous;
    }
  });
});
