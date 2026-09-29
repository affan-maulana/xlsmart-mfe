import { describe, expect, it } from "vitest";

import { createMigrationSchema, migrationDecisionSchema } from "@/lib/schemas";
import { migrationStatusTone } from "@/lib/types";

const valid = {
  msisdn: "0123456789",
  direction: "prepaid-to-postpaid",
  targetPlan: "Postpaid 60",
  reason: "Customer wants a fixed monthly bill for business use.",
  creditCheckRequired: true,
  customerConsent: true,
};

describe("createMigrationSchema", () => {
  it("accepts a well-formed migration", () => {
    expect(createMigrationSchema.safeParse(valid).success).toBe(true);
  });

  it("validates Malaysian MSISDN formats only", () => {
    for (const msisdn of ["+60123456789", "60123456789", "0123456789"]) {
      expect(createMigrationSchema.safeParse({ ...valid, msisdn }).success).toBe(true);
    }

    for (const msisdn of ["123456", "0123", "3475551234", "012345678901234"]) {
      expect(createMigrationSchema.safeParse({ ...valid, msisdn }).success).toBe(false);
    }
  });

  it("refuses to migrate a line without recorded customer consent", () => {
    const result = createMigrationSchema.safeParse({ ...valid, customerConsent: false });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("consent");
    }
  });

  it("catches a direction that contradicts the chosen plan", () => {
    const result = createMigrationSchema.safeParse({
      ...valid,
      direction: "postpaid-to-prepaid",
      targetPlan: "Postpaid 100",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["targetPlan"]);
    }
  });

  it("requires a substantive reason", () => {
    expect(createMigrationSchema.safeParse({ ...valid, reason: "urgent" }).success).toBe(false);
  });
});

describe("migrationDecisionSchema", () => {
  it("requires an audit note", () => {
    expect(migrationDecisionSchema.safeParse({ decision: "approve", note: "ok" }).success).toBe(
      false,
    );
    expect(
      migrationDecisionSchema.safeParse({
        decision: "reject",
        note: "Outstanding balance above threshold.",
      }).success,
    ).toBe(true);
    expect(migrationDecisionSchema.safeParse({ decision: "cancel", note: "Some note here" }).success)
      .toBe(false);
  });
});

describe("migrationStatusTone", () => {
  it("covers every status in the workflow", () => {
    expect(migrationStatusTone("draft")).toBe("neutral");
    expect(migrationStatusTone("pending-review")).toBe("warning");
    expect(migrationStatusTone("approved")).toBe("info");
    expect(migrationStatusTone("completed")).toBe("success");
    expect(migrationStatusTone("rejected")).toBe("danger");
  });
});
