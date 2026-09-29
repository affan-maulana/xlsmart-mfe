import { z } from "zod";

/**
 * Schema-driven validation, shared by the client forms and the BFF route
 * handlers of this domain so the two can never disagree.
 */

export const searchSchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search for at least 2 characters")
    .max(64, "Search is too long"),
});

export type SearchValues = z.infer<typeof searchSchema>;

export const interactionChannel = z.enum(["call", "chat", "email", "visit"]);

export const interactionSchema = z.object({
  customerId: z.string().min(1, "Missing customer"),
  channel: interactionChannel,
  subject: z.string().trim().min(3, "Subject is too short").max(120, "Subject is too long"),
  note: z.string().trim().min(10, "Describe the interaction in at least 10 characters").max(2000),
});

export type InteractionValues = z.infer<typeof interactionSchema>;
