import { z } from "zod";

export const migrationDirections = ["prepaid-to-postpaid", "postpaid-to-prepaid"] as const;

/**
 * Schema-driven validation for the conversion workflow. Malaysian MSISDNs are
 * validated here rather than in a bespoke validator.
 */
export const createMigrationSchema = z
  .object({
    msisdn: z
      .string()
      .trim()
      .regex(/^(\+?60|0)1\d{7,9}$/, "Enter a valid Malaysian mobile number"),
    direction: z.enum(migrationDirections),
    targetPlan: z.string().trim().min(2, "Choose a target plan").max(60),
    reason: z
      .string()
      .trim()
      .min(10, "Explain the reason in at least 10 characters")
      .max(1000),
    creditCheckRequired: z.boolean(),
    // Refine rather than z.literal(true) so React Hook Form can still start the
    // field at false while validation refuses the submission without consent.
    customerConsent: z.boolean().refine((consented) => consented, {
      message: "Customer consent is required before migrating a line",
    }),
  })
  .superRefine((values, context) => {
    if (
      values.direction === "postpaid-to-prepaid" &&
      values.targetPlan.toLowerCase().includes("postpaid")
    ) {
      context.addIssue({
        code: "custom",
        path: ["targetPlan"],
        message: "A postpaid-to-prepaid move needs a prepaid plan",
      });
    }
  });

export type CreateMigrationValues = z.infer<typeof createMigrationSchema>;

export const migrationDecisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  note: z.string().trim().min(5, "Add a short note for the audit trail").max(500),
});

export type MigrationDecisionValues = z.infer<typeof migrationDecisionSchema>;
