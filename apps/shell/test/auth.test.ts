import { describe, expect, it } from "vitest";

import { getNavigation, loginUrlFor, logoutUrlFor } from "@/lib/config";

/**
 * The shell no longer owns sign-in. What it must still get right is where it
 * sends unauthenticated visitors, and with what return target.
 */
describe("shell links to the auth application", () => {
  it("builds a sign-in URL carrying this app as the return target", () => {
    const url = new URL(loginUrlFor("/"));

    expect(url.origin + url.pathname).toBe("https://app.example.test/auth/login");
    expect(url.searchParams.get("next")).toBe("https://app.example.test/");
  });

  it("builds a sign-out URL the same way, so sign-out needs no fetch", () => {
    const url = new URL(logoutUrlFor("/"));

    expect(url.origin + url.pathname).toBe("https://app.example.test/auth/logout");
    expect(url.searchParams.get("next")).toBe("https://app.example.test/");
  });

  it("navigates by URL only, to this platform's own origins", () => {
    // The invariant that keeps the shell from becoming a super application: a
    // navigation target is either a same-origin path or this platform's own
    // origin (absolute, as it must be when apps run on separate ports).
    const platformOrigin = new URL(process.env.PUBLIC_APP_URL ?? "").origin;

    for (const item of getNavigation()) {
      if (item.href.startsWith("/")) continue;

      const target = new URL(item.href);
      expect(target.origin).toBe(platformOrigin);
      expect(target.pathname).toBe(`/${item.id}`);
    }
  });
});
