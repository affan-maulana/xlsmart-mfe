import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.AUTH_DEV_BYPASS;
});

describe("dev bypass", () => {
  it("is off by default", async () => {
    const { devBypassEnabled } = await import("@/lib/auth/dev-bypass");
    expect(devBypassEnabled()).toBe(false);
  });

  it("is on only when the flag is set and NODE_ENV is not production", async () => {
    process.env.AUTH_DEV_BYPASS = "1";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const { devBypassEnabled } = await import("@/lib/auth/dev-bypass");
    expect(devBypassEnabled()).toBe(true);
  });

  it("throws immediately if someone sets the flag in production", async () => {
    process.env.AUTH_DEV_BYPASS = "1";
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    const { devBypassEnabled } = await import("@/lib/auth/dev-bypass");
    expect(() => devBypassEnabled()).toThrow(/NODE_ENV=production/);
  });

  it("refuses to accept a token that is not the dev token", async () => {
    process.env.AUTH_DEV_BYPASS = "1";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    const fetchMock = vi.fn().mockResolvedValue(Response.json({}, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const { verifyToken } = await import("@/lib/auth/identity");
    const result = await verifyToken("not-the-dev-token");

    expect(result.ok).toBe(false);
    expect((result as { status: number }).status).toBe(401);
    expect(fetchMock).toHaveBeenCalled();
  });
});
