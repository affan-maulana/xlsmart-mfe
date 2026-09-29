import { afterEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ token: "eyJhbGciOiJIUzI1NiJ9.good.signature" as string | null }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "mfe_session" && session.token ? { value: session.token } : undefined),
  }),
}));

import { GET } from "@/app/api/session/route";

afterEach(() => {
  vi.unstubAllGlobals();
  session.token = "eyJhbGciOiJIUzI1NiJ9.good.signature";
});

describe("GET /auth/api/session", () => {
  it("returns whitelisted profile fields for a valid session", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: "u1",
        name: "Aisyah Rahman",
        email: "aisyah@company.com",
        role: "agent",
        // Anything extra the service might return must not leak through.
        token: "should-not-be-forwarded",
        permissions: ["everything"],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const body = await (await GET()).json();

    expect(body).toEqual({
      authenticated: true,
      user: {
        id: "u1",
        name: "Aisyah Rahman",
        email: "aisyah@company.com",
        role: "agent",
      },
    });
    expect(JSON.stringify(body)).not.toContain("should-not-be-forwarded");
    expect(fetchMock.mock.calls[0]?.[1]).toHaveProperty("cache", "no-store");
  });

  it("answers 401 when there is no session cookie at all", async () => {
    session.token = null;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(response.status).toBe(401);
    expect((await response.json()).authenticated).toBe(false);
    // No cookie means no reason to call the auth service.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 401 when the service rejects the token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 401 })));

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ authenticated: false, unavailable: false });
  });

  it("answers 503 - not 401 - when the service is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const response = await GET();

    // Callers must be able to tell "signed out" from "identity service down".
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ authenticated: false, unavailable: true });
  });

  it("refuses to treat a malformed profile as an identity", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ hello: "world" })));

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
