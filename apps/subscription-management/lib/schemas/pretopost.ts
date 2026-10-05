import { z } from "zod";

export const pretopostSubmitSchema = z.object({
  packageId: z.string().min(1, "Select a package first"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{10,15}$/.test(val), {
      message: "Phone number must be 10-15 digits",
    }),
});

export type PretopostSubmitInput = z.infer<typeof pretopostSubmitSchema>;
