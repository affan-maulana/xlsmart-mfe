import { describe, expect, it } from "vitest";

import { pretopostSubmitSchema } from "@/lib/schemas/pretopost";

describe("pretopostSubmitSchema", () => {
  it("accepts a complete submission", () => {
    const result = pretopostSubmitSchema.safeParse({
      packageId: "post-ultimate-1",
      email: "agent@company.com",
      phoneNumber: "01234567890",
    });
    expect(result.success).toBe(true);
  });

  it("accepts submission without optional phone number", () => {
    const result = pretopostSubmitSchema.safeParse({
      packageId: "post-ultimate-1",
      email: "agent@company.com",
    });
    expect(result.success).toBe(true);
  });

  it("requires a package selection", () => {
    expect(
      pretopostSubmitSchema.safeParse({
        packageId: "",
        email: "agent@company.com",
      }).success,
    ).toBe(false);
  });

  it("validates email format", () => {
    expect(
      pretopostSubmitSchema.safeParse({
        packageId: "pkg-1",
        email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("validates phone number format when provided", () => {
    expect(
      pretopostSubmitSchema.safeParse({
        packageId: "pkg-1",
        email: "a@b.com",
        phoneNumber: "123",
      }).success,
    ).toBe(false);

    expect(
      pretopostSubmitSchema.safeParse({
        packageId: "pkg-1",
        email: "a@b.com",
        phoneNumber: "01234567890",
      }).success,
    ).toBe(true);
  });
});
