import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/auth/login/route";
import { loginSchema } from "@/lib/auth/schema";

afterEach(() => {
  vi.unstubAllGlobals();
});

function loginRequest(body: unknown) {
  const request = new Request("http://localhost:3004/auth/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  // Route handlers receive a NextRequest; the extra fields are not used here.
  return request as unknown as Parameters<typeof POST>[0];
}

describe("POST /auth/api/auth/login", () => {
  it("rejects a malformed credential set without calling the auth service", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(loginRequest({ email: "not-an-email", password: "short" }));

    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sets an HttpOnly cookie and keeps the token out of the response body", async () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.stub.signature";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: string) =>
        Promise.resolve(
          String(input).endsWith("/v1/me")
            ? Response.json({ id: "u1", name: "Aisyah Rahman", email: "a@company.com", role: "agent" })
            : Response.json({ token: jwt, user: { id: "u1", name: "Aisyah Rahman", email: "a@company.com", role: "agent" } }),
        ),
      ),
    );

    const response = await POST(loginRequest({ email: "a@company.com", password: "correct-horse" }));
    const body = await response.text();

    expect(response.status).toBe(200);
    // The rule that matters: the JWT travels only in the cookie, never in JSON.
    expect(body).not.toContain(jwt);
    expect(body).toContain("Aisyah Rahman");

    const cookie = response.headers.getSetCookie().join(";");
    expect(cookie).toContain(`mfe_session=${jwt}`);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
    expect(cookie.toLowerCase()).toContain("path=/");
  });

  it("refuses to issue a cookie for a token the auth service will not honour", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: string) =>
        Promise.resolve(
          String(input).endsWith("/v1/me")
            ? Response.json({ message: "invalid" }, { status: 401 })
            : Response.json({ token: "forged" }),
        ),
      ),
    );

    const response = await POST(loginRequest({ email: "a@company.com", password: "correct-horse" }));

    expect(response.status).toBe(502);
    expect(response.headers.getSetCookie()).toHaveLength(0);
  });

  it("maps an upstream credential failure to a generic 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ error: "bad" }, { status: 401 })),
    );

    const response = await POST(loginRequest({ email: "a@company.com", password: "wrong-password" }));

    expect(response.status).toBe(401);
    expect((await response.json()).message).toBe("Email or password is incorrect");
  });

  it("reports a clear outage when the auth service is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const response = await POST(loginRequest({ email: "a@company.com", password: "correct-horse" }));

    expect(response.status).toBe(503);
  });
});

describe("loginSchema", () => {
  it("requires a real email and a long enough password", () => {
    expect(loginSchema.safeParse({ email: "a@company.com", password: "12345678" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@company.com", password: "123" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a", password: "12345678" }).success).toBe(false);
  });
});
