import { afterEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));

import { GET } from "@/app/api/session/route";

afterEach(() => {
  fetchMock.mockReset();
  delete process.env.AUTH_DEV_BYPASS;
  delete (process.env as Record<string, unknown>).NODE_ENV;
});

describe("GET /auth/api/session with dev bypass", () => {
  it("returns the dev user with no cookie when the bypass is enabled", async () => {
    process.env.AUTH_DEV_BYPASS = "1";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.authenticated).toBe(true);
    expect(body.dev).toBe(true);
    expect(body.user.email).toBe("dev@localhost");
    // The upstream auth service must never be contacted.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 401 with no cookie when the bypass is off", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const response = await GET();
    expect(response.status).toBe(401);
    expect((await response.json()).authenticated).toBe(false);
  });
});
