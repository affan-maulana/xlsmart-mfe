import { z } from "zod";

/** The only credential schema in the platform: sign-in belongs to this service. */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200, "Password is too long"),
});

export type LoginValues = z.infer<typeof loginSchema>;
