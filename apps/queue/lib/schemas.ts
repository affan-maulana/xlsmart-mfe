import { z } from "zod";

export const queueStatusValues = ["open", "paused", "closed"] as const;

export const createQueueSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60, "Name is too long"),
  slaMinutes: z
    .number({ message: "Target wait time is required" })
    .int("Use whole minutes")
    .min(1, "Target wait must be at least 1 minute")
    .max(240, "Target wait cannot exceed 240 minutes"),
  priorityRouting: z.boolean(),
});

export type CreateQueueValues = z.infer<typeof createQueueSchema>;

export const changeQueueStatusSchema = z.object({
  status: z.enum(queueStatusValues),
});

export type ChangeQueueStatusValues = z.infer<typeof changeQueueStatusSchema>;

/** Ticket actions the Queue domain exposes. Nothing here is owned by the shell. */
export const ticketActionSchema = z.object({
  action: z.enum(["call-next", "serve", "no-show", "recall"]),
  counter: z.string().trim().min(1, "Counter is required").max(40).optional(),
});

export type TicketActionValues = z.infer<typeof ticketActionSchema>;
