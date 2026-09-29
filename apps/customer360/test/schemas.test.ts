import { describe, expect, it } from "vitest";

import { searchSchema, interactionSchema } from "@/lib/schemas";
import { statusTone } from "@/lib/types";

describe("searchSchema", () => {
  it("trims and requires a meaningful query", () => {
    expect(searchSchema.safeParse({ q: "  0123  " }).success).toBe(true);
    expect(searchSchema.safeParse({ q: " 01" }).success).toBe(true);
    expect(searchSchema.safeParse({ q: "0" }).success).toBe(false);
    expect(searchSchema.safeParse({ q: "a".repeat(65) }).success).toBe(false);
  });

  it("returns the trimmed value so the BFF never receives padding", () => {
    const parsed = searchSchema.parse({ q: "  Ashraf  " });
    expect(parsed.q).toBe("Ashraf");
  });
});

describe("interactionSchema", () => {
  it("accepts a complete interaction", () => {
    const result = interactionSchema.safeParse({
      customerId: "c-1",
      channel: "call",
      subject: "Bill shock query",
      note: "Customer disputed a data roaming charge on the 3rd.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown channels and thin notes", () => {
    expect(
      interactionSchema.safeParse({
        customerId: "c-1",
        channel: "carrier-pigeon",
        subject: "Test subject",
        note: "Too short",
      }).success,
    ).toBe(false);

    expect(
      interactionSchema.safeParse({
        customerId: "",
        channel: "call",
        subject: "Test subject",
        note: "This note is definitely long enough to satisfy the rule.",
      }).success,
    ).toBe(false);
  });
});

describe("statusTone", () => {
  it("maps domain status onto presentational tones", () => {
    // The tone mapping is domain knowledge, so it stays here rather than in @repo/ui.
    expect(statusTone("active")).toBe("success");
    expect(statusTone("suspended")).toBe("warning");
    expect(statusTone("closed")).toBe("neutral");
  });
});
