import { describe, expect, it } from "vitest";

import { resolveReturnTarget } from "@/lib/auth/return-path";

const fallback = "https://app.example.test/";

/**
 * `?next=` is where a sign-in page becomes an open redirect, and a relative
 * target would additionally be resolved against this application's own basePath.
 * So only an absolute URL on an allowlisted platform origin is honoured.
 */
describe("resolveReturnTarget", () => {
  it("honours allowlisted absolute origins", () => {
    expect(resolveReturnTarget("http://localhost:3002/queue")).toBe("http://localhost:3002/queue");
    expect(resolveReturnTarget("http://localhost:3000/customer360?q=x")).toBe(
      "http://localhost:3000/customer360?q=x",
    );
    expect(resolveReturnTarget(["http://localhost:3001/customer360"])).toBe(
      "http://localhost:3001/customer360",
    );
    expect(resolveReturnTarget("  http://localhost:3003/pretopost  ")).toBe(
      "http://localhost:3003/pretopost",
    );
  });

  it("falls back for anything that could leave the platform", () => {
    expect(resolveReturnTarget("https://evil.com/collect")).toBe(fallback);
    expect(resolveReturnTarget("http://localhost:9999/")).toBe(fallback);
    expect(resolveReturnTarget("http://localhost:3002.evil.com/")).toBe(fallback);
  });

  it("refuses relative and non-HTTP shapes rather than guessing", () => {
    expect(resolveReturnTarget("/queue")).toBe(fallback);
    expect(resolveReturnTarget("//evil.com")).toBe(fallback);
    expect(resolveReturnTarget("/\\evil.com")).toBe(fallback);
    expect(resolveReturnTarget("javascript:alert(1)")).toBe(fallback);
    expect(resolveReturnTarget("http://[::1]:3002/")).toBe(fallback);
    expect(resolveReturnTarget("queue")).toBe(fallback);
    expect(resolveReturnTarget("")).toBe(fallback);
    expect(resolveReturnTarget(undefined)).toBe(fallback);
    expect(resolveReturnTarget(null)).toBe(fallback);
  });

  it("emits the parsed form, not the attacker's casing", () => {
    // The origin check is done on parsed values, so the returned target must be
    // normalised too - otherwise whatever reads it next has to agree on how.
    expect(resolveReturnTarget("HTTP://LOCALHOST:3002/queue")).toBe("http://localhost:3002/queue");
  });

  it("uses an explicit fallback when a caller wants one", () => {
    expect(resolveReturnTarget("https://evil.com", "/safe")).toBe("/safe");
  });
});
