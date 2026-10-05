import { afterEach, describe, expect, it } from "vitest";

import { STAFF_METADATA, mapSessionUser } from "../src/metadata";
import { getNavigation } from "../src/navigation";

const ENV_KEYS = [
  "CUSTOMER360_URL",
  "QUEUE_URL",
  "SUBSCRIPTION_MANAGEMENT_URL",
] as const;

const original = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("mapSessionUser", () => {
  it("maps the auth service contract and fills shared staff metadata", () => {
    const user = mapSessionUser({ id: "u1", name: "Ayu", email: "a@x.test", role: "agent" });

    expect(user).toEqual({
      id: "u1",
      name: "Ayu",
      email: "a@x.test",
      role: "agent",
      staffId: STAFF_METADATA.staffId,
      locationName: STAFF_METADATA.locationName,
    });
  });

  it("prefers service-supplied staff fields over the placeholders", () => {
    const user = mapSessionUser({
      id: "u1",
      name: "Ayu",
      email: "a@x.test",
      role: "supervisor",
      staffId: "CRR-999",
      branchCode: "JKT-01",
      locationName: "Bandung",
      permissions: ["queue:finish", 42, "queue:read"],
    });

    expect(user.staffId).toBe("CRR-999");
    expect(user.branchCode).toBe("JKT-01");
    expect(user.locationName).toBe("Bandung");
    expect(user.permissions).toEqual(["queue:finish", "queue:read"]);
  });

  it("survives an empty body without throwing", () => {
    const user = mapSessionUser(undefined);

    expect(user.id).toBe("");
    expect(user.role).toBe("agent");
  });
});

describe("getNavigation", () => {
  it("defaults every domain to a same-origin sub-path", async () => {
    for (const key of ENV_KEYS) delete process.env[key];

    const nav = await getNavigation();

    expect(nav.map((item) => item.id)).toEqual([
      "dashboard",
      "customer360",
      "queue",
      "subscription-management",
    ]);
    expect(nav.map((item) => item.href)).toEqual([
      "/",
      "/customer360",
      "/queue",
      "/subscription-management",
    ]);
  });

  it("honours per-environment href overrides and trims trailing slashes", async () => {
    process.env.CUSTOMER360_URL = "https://dev.example.test:3001/customer360/";

    const nav = await getNavigation();
    const customer360 = nav.find((item) => item.id === "customer360");

    expect(customer360?.href).toBe("https://dev.example.test:3001/customer360");
  });
});
